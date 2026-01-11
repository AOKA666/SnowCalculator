import { NextResponse, type NextRequest } from "next/server"
import dns from "node:dns"
import https from "node:https"

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

export const runtime = "nodejs"

dns.setDefaultResultOrder("ipv4first")

type ForecastResponse = {
  city: {
    name: string
    country: string
    timezone: number
  }
  list: Array<{
    dt: number
    pop?: number
    main?: { temp?: number }
    wind?: { speed?: number }
    weather?: Array<{ id?: number; main?: string }>
    snow?: { "3h"?: number }
  }>
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function startOfLocalDayMs(localMs: number) {
  const d = new Date(localMs)
  d.setUTCHours(0, 0, 0, 0)
  return d.getTime()
}

function isRainOrDrizzleSlot(slot: ForecastResponse["list"][number]) {
  const weather = slot.weather ?? []
  return weather.some((w) => w.main === "Rain" || w.main === "Drizzle")
}

function localHour(dtSeconds: number, offsetMs: number) {
  return new Date(dtSeconds * 1000 + offsetMs).getUTCHours()
}

function formatLocationLabel(location: { name: string; country: string; state?: string }) {
  if (location.state) return `${location.name}, ${location.state}, ${location.country}`
  return `${location.name}, ${location.country}`
}

function windLabelFromMps(speedMps: number | undefined) {
  const mps = speedMps ?? 0
  const mph = mps * 2.2369362920544
  const label =
    mph < 10 ? "Light" : mph < 20 ? "Moderate" : mph < 30 ? "Strong" : mph < 40 ? "Very strong" : "Severe"
  return { label, mph }
}

const UPSTREAM_TIMEOUT_MS = 25_000
const FORECAST_TTL_MS = 10 * 60 * 1000
const FORECAST_STALE_IF_ERROR_MS = 30 * 60 * 1000
const HEDGE_DELAY_MS = 250

function httpsJsonRequest<T>(
  url: URL,
  timeoutMs: number,
): { promise: Promise<{ status: number; json: T | null }>; abort: () => void } {
  let aborted = false
  let req: ReturnType<typeof https.request> | null = null

  const abort = () => {
    aborted = true
    req?.destroy(Object.assign(new Error("Aborted"), { code: "ABORTED" }))
  }

  const promise = new Promise<{ status: number; json: T | null }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      req?.destroy(Object.assign(new Error("Upstream timeout"), { code: "UPSTREAM_TIMEOUT" }))
    }, timeoutMs)

    req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port ? Number(url.port) : undefined,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: {
          accept: "application/json",
          "user-agent": "snow_calculator/1.0",
        },
      },
      (res) => {
        const status = res.statusCode ?? 0
        const chunks: Buffer[] = []
        res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
        res.on("end", () => {
          clearTimeout(timeout)
          const text = Buffer.concat(chunks).toString("utf8")
          if (!text) return resolve({ status, json: null })
          try {
            resolve({ status, json: JSON.parse(text) as T })
          } catch {
            resolve({ status, json: null })
          }
        })
      },
    )

    req.on("error", (e) => {
      clearTimeout(timeout)
      if (aborted) return resolve({ status: 0, json: null })
      reject(e)
    })
    req.end()
  })

  return { promise, abort }
}

async function getJson<T>(url: URL, timeoutMs: number): Promise<{ status: number; json: T | null }> {
  const fetchOnce = async (signal: AbortSignal) => {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "user-agent": "snow_calculator/1.0",
      },
      cache: "no-store",
      signal,
    })

    const status = res.status
    const text = await res.text()
    if (!text) return { status, json: null as T | null }

    try {
      return { status, json: JSON.parse(text) as T }
    } catch {
      return { status, json: null as T | null }
    }
  }

  const primary = new AbortController()
  const primaryTimeout = setTimeout(() => primary.abort(), timeoutMs)

  let secondaryAbort: unknown = null

  const primaryPromise = fetchOnce(primary.signal)
  // Prevent unhandledRejection if this loses the race and fails later.
  void primaryPromise.catch(() => {})

  const secondaryPromise = new Promise<{ status: number; json: T | null }>((resolve, reject) => {
    const timer = setTimeout(() => {
      const req = httpsJsonRequest<T>(url, timeoutMs)
      secondaryAbort = req.abort
      const p = req.promise
      // Prevent unhandledRejection if this loses the race and fails later.
      void p.catch(() => {})
      p.then(resolve, reject)
    }, HEDGE_DELAY_MS)
    primaryPromise.finally(() => clearTimeout(timer))
  })

  try {
    const winner = await Promise.race([
      primaryPromise.then((r) => ({ which: "primary" as const, ...r })),
      secondaryPromise.then((r) => ({ which: "secondary" as const, ...r })),
    ])

    if (winner.which === "primary") {
      if (typeof secondaryAbort === "function") (secondaryAbort as () => void)()
    } else {
      primary.abort()
    }

    return { status: winner.status, json: winner.json }
  } catch (e) {
    if (typeof secondaryAbort === "function") (secondaryAbort as () => void)()
    if (e && typeof e === "object" && "name" in e && (e as { name?: unknown }).name === "AbortError") {
      throw Object.assign(new Error("Upstream timeout"), { code: "UPSTREAM_TIMEOUT" })
    }
    throw e
  } finally {
    clearTimeout(primaryTimeout)
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function isRetriableUpstreamError(e: unknown) {
  const code = (e as { code?: unknown } | null)?.code
  if (typeof code !== "string") return false
  return (
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "EPIPE" ||
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    code.startsWith("UND_")
  )
}

async function getJsonWithRetry<T>(url: URL, timeoutMs: number): Promise<{
  attempts: number
  durationMs: number
  status: number
  json: T | null
}> {
  const startedAt = Date.now()
  try {
    const first = await getJson<T>(url, timeoutMs)
    return { attempts: 1, durationMs: Date.now() - startedAt, ...first }
  } catch (e) {
    if (!isRetriableUpstreamError(e) || (e as { code?: unknown } | null)?.code === "UPSTREAM_TIMEOUT") {
      throw e
    }
    await sleep(250)
    const second = await getJson<T>(url, timeoutMs)
    return { attempts: 2, durationMs: Date.now() - startedAt, ...second }
  }
}

type CacheEntry = { expiresAtMs: number; body: unknown }
const responseCache = new Map<string, CacheEntry>()
type ForecastCacheEntry = {
  updatedAtMs: number
  expiresAtMs: number
  forecast?: ForecastResponse
  lastUpstream?: { attempts: number; durationMs: number }
  inFlight?: Promise<{ forecast: ForecastResponse; upstream: { attempts: number; durationMs: number } }>
}
const forecastCache = new Map<string, ForecastCacheEntry>()

async function getForecastCached(
  cacheKey: string,
  url: URL,
): Promise<{ forecast: ForecastResponse; cache: "HIT" | "STALE" | "MISS"; upstream: { attempts: number; durationMs: number } }> {
  const now = Date.now()
  const existing = forecastCache.get(cacheKey)

  if (existing && existing.forecast && existing.expiresAtMs > now) {
    return { forecast: existing.forecast, cache: "HIT", upstream: { attempts: 0, durationMs: 0 } }
  }

  if (existing?.inFlight) {
    const done = await existing.inFlight
    const cache = existing.forecast && existing.expiresAtMs > now ? "HIT" : "STALE"
    return { forecast: done.forecast, cache, upstream: done.upstream }
  }

  // Serve stale immediately and refresh in background.
  if (existing?.forecast && existing.expiresAtMs <= now) {
    void (async () => {
      try {
        const forecastRes = await getJsonWithRetry<ForecastResponse | { message?: string }>(url, UPSTREAM_TIMEOUT_MS)
        const forecastAny = forecastRes.json
        if (
          forecastRes.status < 200 ||
          forecastRes.status >= 300 ||
          !forecastAny ||
          !Array.isArray((forecastAny as ForecastResponse).list)
        ) {
          return
        }
        const next = forecastAny as ForecastResponse
        const upstream = { attempts: forecastRes.attempts, durationMs: forecastRes.durationMs }
        forecastCache.set(cacheKey, {
          updatedAtMs: Date.now(),
          expiresAtMs: Date.now() + FORECAST_TTL_MS,
          forecast: next,
          lastUpstream: upstream,
        })
      } catch {
        // Ignore refresh failures; caller still got stale data quickly.
      }
    })()

    return { forecast: existing.forecast, cache: "STALE", upstream: existing.lastUpstream ?? { attempts: 0, durationMs: 0 } }
  }

  const inFlight = (async () => {
    const forecastRes = await getJsonWithRetry<ForecastResponse | { message?: string }>(url, UPSTREAM_TIMEOUT_MS)
    const forecastAny = forecastRes.json
    if (
      forecastRes.status < 200 ||
      forecastRes.status >= 300 ||
      !forecastAny ||
      !Array.isArray((forecastAny as ForecastResponse).list)
    ) {
      const message = (forecastAny as { message?: string } | null)?.message ?? "Failed to fetch forecast."
      throw Object.assign(new Error(message), { code: "UPSTREAM_BAD_RESPONSE", status: forecastRes.status || 502 })
    }
    const next = forecastAny as ForecastResponse
    const upstream = { attempts: forecastRes.attempts, durationMs: forecastRes.durationMs }
    forecastCache.set(cacheKey, {
      updatedAtMs: Date.now(),
      expiresAtMs: Date.now() + FORECAST_TTL_MS,
      forecast: next,
      lastUpstream: upstream,
    })
    return { forecast: next, upstream }
  })()

  forecastCache.set(cacheKey, {
    updatedAtMs: existing?.updatedAtMs ?? now,
    expiresAtMs: existing?.expiresAtMs ?? now + FORECAST_TTL_MS,
    forecast: existing?.forecast,
    lastUpstream: existing?.lastUpstream,
    inFlight,
  })

  try {
    const done = await inFlight
    return { forecast: done.forecast, cache: "MISS", upstream: done.upstream }
  } catch (e) {
    // If we have a recently-stale forecast, serve it instead of failing.
    const fallback = forecastCache.get(cacheKey)
    if (fallback?.forecast && now - fallback.updatedAtMs <= FORECAST_STALE_IF_ERROR_MS) {
      return { forecast: fallback.forecast, cache: "STALE", upstream: { attempts: 0, durationMs: 0 } }
    }
    throw e
  } finally {
    const cur = forecastCache.get(cacheKey)
    if (cur) delete cur.inFlight
  }
}

export async function GET(req: NextRequest) {
  const requestStartedAt = Date.now()

  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json({ error: "Missing server env var OPENWEATHER_API_KEY." }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const city = (searchParams.get("city") ?? "").trim()
  const zip = (searchParams.get("zip") ?? "").trim()
  const country = (searchParams.get("country") ?? "US").trim() || "US"
  const readiness = (searchParams.get("readiness") ?? "medium").trim().toLowerCase()

  if (!city && !zip) {
    return NextResponse.json({ error: "Provide at least one of: city, zip." }, { status: 400 })
  }

  const readinessFactor = readiness === "high" ? 0.75 : readiness === "low" ? 1.25 : 1.0
  const readinessLabel = readiness === "high" ? "High" : readiness === "low" ? "Low" : "Medium"

  const locationKey = `${zip ? `zip:${zip},${country}` : `city:${city},${country}`}`
  const cacheKey = `${locationKey}|readiness:${readinessLabel}`
  const cached = responseCache.get(cacheKey)
  if (cached && cached.expiresAtMs > Date.now()) {
    const res = NextResponse.json(cached.body)
    res.headers.set("x-cache", "HIT")
    res.headers.set("server-timing", `total;dur=${Date.now() - requestStartedAt}`)
    return res
  }

  let forecastJson: ForecastResponse
  let upstreamDurationMs = 0
  let upstreamAttempts = 0
  let forecastCacheStatus: "HIT" | "STALE" | "MISS" = "MISS"

  try {
    const forecastUrl = new URL("https://api.openweathermap.org/data/2.5/forecast")
    if (zip) {
      forecastUrl.searchParams.set("zip", `${zip},${country}`)
    } else {
      // If user already typed "City, ST" or "City,Country", keep as-is.
      const q = city.includes(",") ? city : `${city},${country}`
      forecastUrl.searchParams.set("q", q)
    }
    forecastUrl.searchParams.set("units", "metric")
    // Reduce payload (16 * 3h = 48h), still covers "tomorrow" in local time.
    forecastUrl.searchParams.set("cnt", "16")
    forecastUrl.searchParams.set("appid", OPENWEATHER_API_KEY)

    const forecastRes = await getForecastCached(locationKey, forecastUrl)
    forecastJson = forecastRes.forecast
    forecastCacheStatus = forecastRes.cache
    upstreamAttempts = forecastRes.upstream.attempts
    upstreamDurationMs = forecastRes.upstream.durationMs
  } catch (e) {
    const code =
      (e as { code?: unknown; cause?: unknown } | null)?.code ??
      ((e as { cause?: { code?: unknown } } | null)?.cause?.code as unknown)
    if (code === "UPSTREAM_TIMEOUT") {
      return NextResponse.json(
        { error: `OpenWeatherMap request timed out after ${Math.round(UPSTREAM_TIMEOUT_MS / 1000)}s. Please try again.` },
        { status: 504 },
      )
    }
    const extra = typeof code === "string" ? ` (${code})` : ""
    return NextResponse.json({ error: `Unable to reach OpenWeatherMap API${extra}.` }, { status: 502 })
  }

  const offsetMs = ((forecastJson.city?.timezone ?? 0) as number) * 1000
  const localNowMs = Date.now() + offsetMs
  const localTomorrowStartMs = startOfLocalDayMs(localNowMs) + 24 * 60 * 60 * 1000
  const localTomorrowEndMs = localTomorrowStartMs + 24 * 60 * 60 * 1000

  const tomorrowSlots = forecastJson.list.filter((slot) => {
    const localSlotMs = slot.dt * 1000 + offsetMs
    return localSlotMs >= localTomorrowStartMs && localSlotMs < localTomorrowEndMs
  })

  const snowMorningCm =
    tomorrowSlots
      .filter((slot) => {
        const h = localHour(slot.dt, offsetMs)
        return h >= 0 && h < 12
      })
      .reduce((sum, slot) => sum + (slot.snow?.["3h"] ?? 0), 0) / 10

  const snowOvernightCm =
    tomorrowSlots
      .filter((slot) => {
        const h = localHour(slot.dt, offsetMs)
        return h >= 0 && h < 6
      })
      .reduce((sum, slot) => sum + (slot.snow?.["3h"] ?? 0), 0) / 10

  const snow3to9Cm =
    tomorrowSlots
      .filter((slot) => {
        const h = localHour(slot.dt, offsetMs)
        return h >= 3 && h < 9
      })
      .reduce((sum, slot) => sum + (slot.snow?.["3h"] ?? 0), 0) / 10

  const overnightTempSlots = tomorrowSlots.filter((slot) => {
    const h = localHour(slot.dt, offsetMs)
    return h >= 0 && h < 6
  })
  const minOvernightTempC = (overnightTempSlots.length ? overnightTempSlots : tomorrowSlots)
    .map((slot) => slot.main?.temp)
    .filter((t): t is number => typeof t === "number")
    .reduce((min, t) => Math.min(min, t), Number.POSITIVE_INFINITY)

  const minTomorrowTempC = tomorrowSlots
    .map((slot) => slot.main?.temp)
    .filter((t): t is number => typeof t === "number")
    .reduce((min, t) => Math.min(min, t), Number.POSITIVE_INFINITY)

  const rainOrDrizzleTempC = tomorrowSlots
    .filter(isRainOrDrizzleSlot)
    .map((slot) => slot.main?.temp)
    .filter((t): t is number => typeof t === "number")
    .reduce((min, t) => Math.min(min, t), Number.POSITIVE_INFINITY)

  let snowImpactScore = 0
  if (snowMorningCm >= 15) snowImpactScore = 15
  else if (snowMorningCm >= 10) snowImpactScore = 13
  else if (snowMorningCm >= 6) snowImpactScore = 10
  else if (snowMorningCm >= 3) snowImpactScore = 8
  else if (snowMorningCm >= 1) snowImpactScore = 4

  let commuteScore = 0
  if (snow3to9Cm >= 6) commuteScore = 15
  else if (snow3to9Cm >= 3) commuteScore = 12
  else if (snow3to9Cm >= 1) commuteScore = 6

  const maxWindMps = tomorrowSlots
    .map((slot) => slot.wind?.speed)
    .filter((s): s is number => typeof s === "number")
    .reduce((max, s) => Math.max(max, s), 0)
  const wind = windLabelFromMps(maxWindMps)

  let windScore = 0
  if (maxWindMps >= 16) windScore = 10
  else if (maxWindMps >= 12) windScore = 6
  else if (maxWindMps >= 8) windScore = 2

  let iceScoreA = 0
  if (Number.isFinite(rainOrDrizzleTempC)) {
    if (rainOrDrizzleTempC <= -1) iceScoreA = 30
    else if (rainOrDrizzleTempC <= 1) iceScoreA = 20
  }

  const iceScoreB = snowOvernightCm >= 2 && Number.isFinite(minOvernightTempC) && minOvernightTempC <= -4 ? 12 : 0
  const iceRiskScore = Math.min(35, Math.max(iceScoreA, iceScoreB))

  const hazardScore = snowImpactScore + iceRiskScore + commuteScore + windScore
  const closureScore = clamp(hazardScore * readinessFactor, 0, 100)

  const probRaw = 100 / (1 + Math.exp(-(closureScore - 55) / 9))
  const probability = clamp(probRaw, 2, 98)

  const drivers = [
    {
      score: iceRiskScore,
      label: "Ice risk",
      value:
        iceScoreA > 0
          ? `High (rain/drizzle near ${Number.isFinite(rainOrDrizzleTempC) ? `${Math.round(rainOrDrizzleTempC)}°C` : "0°C"})`
          : iceScoreB > 0
            ? `Moderate (refreeze risk; min ${Number.isFinite(minOvernightTempC) ? `${Math.round(minOvernightTempC)}°C` : "N/A"})`
            : "Low",
    },
    { score: commuteScore, label: "Snow during commute (03:00–09:00)", value: `${snow3to9Cm.toFixed(1)} cm` },
    { score: snowImpactScore, label: "Total morning snow (00:00–12:00)", value: `${snowMorningCm.toFixed(1)} cm` },
    { score: windScore, label: "Wind conditions (max)", value: `${wind.label} (${Math.round(wind.mph)} mph)` },
    { score: 0, label: "Snow readiness", value: `${readinessLabel} (${readinessFactor.toFixed(2)}×)` },
    {
      score: 0,
      label: "Min temperature (tomorrow)",
      value: Number.isFinite(minTomorrowTempC) ? `${Math.round(minTomorrowTempC)}°C` : "N/A",
    },
  ].sort((a, b) => b.score - a.score)

  const factors = drivers.map(({ label, value }) => ({ label, value }))

  const resolvedLabel = formatLocationLabel({
    name: forecastJson.city?.name ?? (zip ? zip : city),
    country: forecastJson.city?.country ?? country,
  })

  const body = {
    probability: Math.round(probability),
    location: resolvedLabel,
    factors,
  }

  // Cache for a short time to speed up repeated queries.
  responseCache.set(cacheKey, { expiresAtMs: Date.now() + 2 * 60 * 1000, body })

  const res = NextResponse.json(body)
  res.headers.set("cache-control", "public, s-maxage=120, stale-while-revalidate=60")
  res.headers.set("x-cache", "MISS")
  res.headers.set("x-forecast-cache", forecastCacheStatus)
  res.headers.set("x-upstream-attempts", String(upstreamAttempts))
  res.headers.set(
    "server-timing",
    `owm;dur=${Math.round(upstreamDurationMs)}, total;dur=${Math.round(Date.now() - requestStartedAt)}`,
  )
  return res
}
