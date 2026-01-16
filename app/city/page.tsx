import Link from "next/link"
import type { Metadata } from "next"

import { CityCarousel } from "@/components/city-carousel"
import { cityProfiles } from "@/data/city-data"

export const metadata: Metadata = {
  title: "City Snow Day Forecasts | Snow Day Calculator",
  description:
    "Browse snow day forecasts for Ohio, Boston, and Denver in one place. Learn how cities decide on school closures and what conditions trigger a snow day.",
}

export default function CityPage() {
  const generalBulletPoints = [
    "We merge national weather services, district transportation reports, and local conditions to keep each city’s status up to date.",
    "Hourly updates make sure you see the most recent closure chance before the daily announcement window.",
    "Each city page includes the thresholds, closure timing, and high-frequency questions families ask before a snow event.",
  ]

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">City Forecasts</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Will schools be closed tomorrow in Ohio, Boston, or Denver?
          </h1>
          <p className="text-lg text-muted-foreground">
            This hub gives you a single view of the three city forecasts, highlighting the weather sparks that each school
            district weighs before canceling classes.
          </p>
        </header>

        <CityCarousel cities={cityProfiles} />

        <section className="space-y-4 rounded-2xl border border-border bg-white/80 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Snow Day Forecast</p>
          <h2 className="text-2xl font-bold text-foreground">Snow Day Forecast / School Closure Prediction</h2>
          <p className="text-muted-foreground">
            Each statement combines weather data, transit conditions, and historical district responses, translating them
            into a summarized closure probability for the morning commute.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-foreground">
            {generalBulletPoints.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-muted/30 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Why Schools Close</p>
          <h2 className="text-2xl font-bold text-foreground">Regional Closure Drivers</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {cityProfiles.map((city) => (
              <article key={city.name} className="rounded-xl border border-border/60 bg-white/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{city.name}</p>
                <div className="mt-3 space-y-2">
                  {city.whyHighlights.map((highlight) => (
                    <p key={highlight} className="text-sm text-foreground">
                      {highlight}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Snow Thresholds</p>
          <h2 className="text-2xl font-bold text-foreground">How Much Snow Causes School Closures?</h2>
          <div className="space-y-4">
            {cityProfiles.map((city) => (
              <article key={city.name} className="rounded-xl border border-border/50 bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{city.name}</h3>
                  <span className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    {city.currentChance}% chance today
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {city.snowThresholds.map((threshold) => (
                    <div key={`${city.name}-${threshold.range}`} className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{threshold.range}</p>
                      <p className="text-sm text-muted-foreground">{threshold.impact}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-white/90 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Timing</p>
          <h2 className="text-2xl font-bold text-foreground">When Are Closure Decisions Made?</h2>
          <div className="space-y-4">
            {cityProfiles.map((city) => (
              <article key={`timing-${city.name}`} className="rounded-xl border border-border/60 bg-muted/40 p-4">
                <p className="text-base font-semibold text-foreground">{city.name}</p>
                <p className="text-sm text-muted-foreground">{city.decisionWindow}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-muted/30 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">City FAQ</p>
          <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions by City</h2>
          <div className="space-y-4">
            {cityProfiles.map((city) => (
              <article key={`faq-${city.name}`} className="rounded-2xl border border-border/60 bg-white/70 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">{city.name}</p>
                <div className="mt-3 space-y-3">
                  {city.faq.slice(0, 2).map((item) => (
                    <div key={item.question} className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{item.question}</p>
                      <p className="text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Related Forecasts</p>
          <h2 className="text-3xl font-bold text-foreground">Need more context?</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Dive into the blog for a breakdown of closure criteria, or visit the FAQ page for broader answers that apply
            to all cities.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/blog"
              className="rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Read the blog
            </Link>
            <Link
              href="/faq"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary"
            >
              School Closure FAQ
            </Link>
            <Link
              href="/"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary"
            >
              Back to Calculator
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
