import { NextResponse, type NextRequest } from "next/server"

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const REQUEST_TIMEOUT_MS = 5_000

type DirectResult = {
  name: string
  state?: string
  country: string
}

type ZipResult = {
  name: string
  zip: string
  country: string
  state?: string
}

function formatPlaceLabel(place: { name: string; state?: string; country: string }) {
  return `${place.name}${place.state ? `, ${place.state}` : ""}, ${place.country}`
}

function isLikelyZipQuery(value: string) {
  const normalized = value.replace(/\s+/g, "")
  if (!normalized) return false
  return /^[0-9]{3,10}$/.test(normalized)
}

async function fetchJsonWithTimeout<T>(url: URL): Promise<{ ok: boolean; status: number; json: T | null }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    })
    const json = (await res.json().catch(() => null)) as T | null
    return { ok: res.ok, status: res.status, json }
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(req: NextRequest) {
  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json({ error: "Missing server env var OPENWEATHER_API_KEY." }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const query = (searchParams.get("query") ?? searchParams.get("q") ?? "").trim()
  const country = (searchParams.get("country") ?? "US").trim() || "US"

  if (!query) {
    return NextResponse.json({ suggestions: [] })
  }

  const looksLikeZip = isLikelyZipQuery(query)
  const suggestions: Array<{ id: string; label: string; value: string; country: string }> = []

  try {
    if (looksLikeZip) {
      const zipUrl = new URL("https://api.openweathermap.org/geo/1.0/zip")
      zipUrl.searchParams.set("zip", `${query.replace(/\s+/g, "")},${country}`)
      zipUrl.searchParams.set("appid", OPENWEATHER_API_KEY)

      const zipRes = await fetchJsonWithTimeout<ZipResult>(zipUrl)
      const zipJson = zipRes.json

      if (zipRes.ok && zipJson?.zip && zipJson.name && zipJson.country) {
        suggestions.push({
          id: `zip-${zipJson.zip}-${zipJson.country}`,
          label: `${formatPlaceLabel(zipJson)} (${zipJson.zip})`,
          value: zipJson.zip,
          country: zipJson.country,
        })
      }
    }

    const directUrl = new URL("https://api.openweathermap.org/geo/1.0/direct")
    directUrl.searchParams.set("q", query)
    directUrl.searchParams.set("limit", "5")
    directUrl.searchParams.set("appid", OPENWEATHER_API_KEY)

    const directRes = await fetchJsonWithTimeout<DirectResult[]>(directUrl)
    const directJson = directRes.json

    if (directRes.ok && Array.isArray(directJson)) {
      for (const place of directJson) {
        if (!place?.name || !place?.country) continue
        const label = formatPlaceLabel(place)
        const id = `${label}-${place.country}`.replace(/\s+/g, "-").toLowerCase()
        suggestions.push({
          id,
          label,
          value: label,
          country: place.country,
        })
      }
    }
  } catch {
    // Best-effort suggestions; failures fall through to empty list.
  }

  const res = NextResponse.json({ suggestions })
  res.headers.set("cache-control", "public, s-maxage=300, stale-while-revalidate=300")
  return res
}
