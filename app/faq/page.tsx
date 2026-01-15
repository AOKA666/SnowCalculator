import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "School Closure FAQ | Snow Day & School Cancellation Questions",
  description:
    "Find answers to common questions about school closures, snow days, weather conditions, and how schools decide to cancel classes.",
}

const faqs = [
  {
    question: "How do schools decide to close for snow?",
    answer:
      "Districts monitor snowfall totals, wind, temperature, and the ability of transportation crews to keep routes clear. They also check nearby municipal reports and transit alerts before canceling classes.",
  },
  {
    question: "How much snow causes school closures?",
    answer:
      "There is no single number. Most districts start weighing closures when snowfall exceeds 4-6 inches, especially if snow falls before dawn or includes heavy wind. Local terrain and roads also influence every decision.",
  },
  {
    question: "Is ice more dangerous than snow?",
    answer:
      "Yes. Ice-coated roads and sidewalks are harder to plow and treat, making transportation unreliable. Districts pay close attention to forecasts that include freezing rain or sleet.",
  },
  {
    question: "What temperature causes school cancellations?",
    answer:
      "Temperatures below zero combined with wind chills increase the chance of a closure, particularly when crews cannot keep sidewalks and bus routes safe before students arrive.",
  },
  {
    question: "When are school closure decisions announced?",
    answer:
      "Most announcements come between 4:30 AM and 7:00 AM, depending on the district and how quickly crews can confirm route safety. Stay tuned to district alerts and this site for updates.",
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.4em] text-primary">FAQ</p>
          <h1 className="text-4xl font-bold text-foreground">School Closure FAQ</h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about snow days, cancellation criteria, and what to expect on cold or snowy
            mornings.
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-8">
          {faqs.map((faq) => (
            <article key={faq.question} className="space-y-2 rounded-xl border border-border/60 bg-white/70 p-5">
              <p className="text-lg font-semibold text-foreground">{faq.question}</p>
              <p className="text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Still curious?</p>
          <h2 className="text-3xl font-bold text-foreground">Dive deeper into snow day logic</h2>
          <p className="text-muted-foreground">
            Visit our blog for breakdowns of forecasts, plus read city-specific pages for Chicago, Boston, and Denver to
            see how decisions vary by region.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/blog"
              className="rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Read the blog
            </Link>
            <Link
              href="/city"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary"
            >
              City Forecasts
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
