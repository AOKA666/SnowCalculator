"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import type { CityProfile } from "@/data/city-data"

const AUTO_ADVANCE_MS = 6000

type CityCarouselProps = {
  cities: CityProfile[]
}

export function CityCarousel({ cities }: CityCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cities.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [cities.length])

  const activeCity = cities[activeIndex]

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + cities.length) % cities.length)
  const goNext = () => setActiveIndex((prev) => (prev + 1) % cities.length)

  return (
    <section className="rounded-[32px] border border-border bg-card p-8 shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">City Snapshot</p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{activeCity.name}</h2>
          <p className="text-sm text-muted-foreground">{activeCity.statusLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full border border-border px-3 py-2 text-muted-foreground transition hover:border-primary/80 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Show previous city forecast"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full border border-border px-3 py-2 text-muted-foreground transition hover:border-primary/80 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Show next city forecast"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <div className="flex items-baseline gap-4">
          <p className="text-6xl font-extrabold text-foreground">{activeCity.currentChance}%</p>
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            School Closure Chance
          </span>
        </div>
        <p className="text-base text-muted-foreground">{activeCity.trend}</p>
        <div className="flex items-center gap-2">
          {cities.map((city, index) => (
            <button
              key={city.slug}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 w-8 rounded-full transition ${
                index === activeIndex ? "bg-primary" : "bg-border/60"
              }`}
              aria-label={`Show ${city.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
