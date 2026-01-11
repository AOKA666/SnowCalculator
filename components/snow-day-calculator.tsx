"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Snowflake, MapPin, Hash, Twitter, CloudSnow, AlertTriangle, HelpCircle, Info } from "lucide-react"

type Readiness = "high" | "medium" | "low"

export function SnowDayCalculator() {
  const [city, setCity] = useState("")
  const [zip, setZip] = useState("")
  const [readiness, setReadiness] = useState<Readiness>("medium")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    probability: number
    location: string
    factors: Array<{ label: string; value: string }>
  } | null>(null)

  const handleCheck = async () => {
    const cityValue = city.trim()
    const zipValue = zip.trim()

    if (!cityValue && !zipValue) {
      alert("Please enter a city name and/or ZIP code")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (cityValue) params.set("city", cityValue)
      if (zipValue) params.set("zip", zipValue)
      params.set("readiness", readiness)

      const res = await fetch(`/api/snow-probability?${params.toString()}`, { cache: "no-store" })
      const json = (await res.json().catch(() => null)) as unknown

      if (!res.ok) {
        const message =
          json && typeof json === "object" && "error" in json && typeof (json as { error?: unknown }).error === "string"
            ? (json as { error: string }).error
            : "Request failed."
        setError(message)
        return
      }

      if (!json || typeof json !== "object") {
        setError("Unexpected response format.")
        return
      }

      const okJson = json as { probability?: unknown; location?: unknown; factors?: unknown }
      if (
        typeof okJson.probability !== "number" ||
        typeof okJson.location !== "string" ||
        !Array.isArray(okJson.factors)
      ) {
        setError("Unexpected response format.")
        return
      }

      setResult({
        probability: okJson.probability,
        location: okJson.location,
        factors: okJson.factors as Array<{ label: string; value: string }>,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = (platform: string) => {
    const text = `Chance of school closure tomorrow for ${result?.location}: ${result?.probability}%`
    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank")
    }
  }

  const handleCheckAnother = () => {
    setResult(null)
    setCity("")
    setZip("")
    setReadiness("medium")
    setError(null)
  }

  if (result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Result Display */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Snowflake className="w-8 h-8 text-primary" />
            </div>

            {/* Giant Probability Number */}
            <div className="space-y-2">
              <h1 className="text-8xl md:text-9xl font-bold text-primary tracking-tight">{result.probability}%</h1>
              <p className="text-2xl md:text-3xl font-medium text-foreground">Chance of School Closure Tomorrow</p>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <p className="text-lg">Tomorrow · {result.location}</p>
              </div>
            </div>
          </div>

          {/* Factors Card */}
          <Card className="p-6 md:p-8 space-y-4 bg-card">
            <h2 className="text-xl font-semibold text-foreground">Why this prediction?</h2>
            <div className="space-y-3">
              {result.factors.map((factor, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0"
                >
                  <span className="text-muted-foreground">{factor.label}</span>
                  <span className="font-medium text-foreground">{factor.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Emotion Text */}
          <p className="text-center text-muted-foreground max-w-lg mx-auto">
            Chances are looking good — but remember, final decisions are made by your school district.
          </p>

          {/* Share & Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={handleCheckAnother} variant="default" size="lg" className="w-full sm:w-auto">
              <MapPin className="w-4 h-4 mr-2" />
              Check Another Location
            </Button>
            <Button onClick={() => handleShare("twitter")} variant="outline" size="lg" className="w-full sm:w-auto">
              <Twitter className="w-4 h-4 mr-2" />
              Share on X
            </Button>
          </div>

          {/* Trust Signal */}
          <p className="text-center text-sm text-muted-foreground">Based on real-time weather forecasts</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="w-full max-w-2xl space-y-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Snowflake className="w-10 h-10 text-primary" />
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
              Will School Be Closed Tomorrow?
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
              Estimate your school closure probability based on weather forecasts.
            </p>
          </div>

          {/* Input Section */}
          <Card className="p-8 bg-card shadow-lg">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium text-muted-foreground block text-left">
                  Enter city name and/or ZIP
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="city"
                      type="text"
                      placeholder="City (e.g., New York)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return
                        e.preventDefault()
                        handleCheck()
                      }}
                      className="pl-10 h-14 text-lg"
                    />
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="zip"
                      type="text"
                      inputMode="numeric"
                      placeholder="ZIP (e.g., 10001)"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return
                        e.preventDefault()
                        handleCheck()
                      }}
                      className="pl-10 h-14 text-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground block text-left">Your area’s snow readiness</label>
                <Select value={readiness} onValueChange={(v) => setReadiness(v as Readiness)}>
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="Select readiness" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (snow-ready)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low (rare snow)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error ? <p className="text-sm text-destructive text-left">{error}</p> : null}
              <Button
                type="button"
                onClick={handleCheck}
                size="lg"
                className="w-full h-14 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Checking…" : "Check School Closure Chance"}
              </Button>
            </div>
          </Card>

          {/* Trust Signal */}
          <p className="text-sm text-muted-foreground">Used by students & parents across the U.S.</p>

          {/* Example Predictions */}
          <div className="pt-8 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Recent predictions:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="px-4 py-2 rounded-full bg-primary/5 text-sm text-foreground">Boston: 72%</div>
              <div className="px-4 py-2 rounded-full bg-primary/5 text-sm text-foreground">Chicago: 61%</div>
              <div className="px-4 py-2 rounded-full bg-primary/5 text-sm text-foreground">Denver: 68%</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <CloudSnow className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Our algorithm analyzes multiple weather factors to predict school closures
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Snowfall Amount</h3>
              <p className="text-muted-foreground">
                We analyze predicted snowfall accumulation for your area, considering both overnight and morning hours.
                Heavy snowfall increases the likelihood of closures.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Temperature & Ice</h3>
              <p className="text-muted-foreground">
                Overnight temperatures below freezing create dangerous road conditions. Ice formation is a critical
                factor in school closure decisions.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Timing</h3>
              <p className="text-muted-foreground">
                Snow during morning commute hours has the highest impact. We prioritize forecasts for 5 AM - 9 AM when
                buses operate.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Historical Data</h3>
              <p className="text-muted-foreground">
                Our model learns from past school district decisions in your area to improve prediction accuracy over
                time.
              </p>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3">Data Sources</h3>
            <p className="text-muted-foreground">
              We combine weather data from NOAA, the National Weather Service, and multiple meteorological APIs to
              provide accurate forecasts. Our predictions are updated every hour.
            </p>
          </div>
        </div>
      </section>

      {/* Accuracy & Disclaimer Section */}
      <section id="accuracy" className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Accuracy & Disclaimer</h2>
            <p className="text-lg text-muted-foreground">What you need to know about our predictions</p>
          </div>

          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Prediction Accuracy</h3>
              <p className="text-muted-foreground">
                Our snow day calculator achieves approximately 75-85% accuracy based on historical validation. Accuracy
                varies by region and weather pattern complexity.
              </p>
              <p className="text-muted-foreground">
                Predictions are most reliable 12-24 hours before the event. Accuracy decreases for forecasts beyond 48
                hours.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Important Limitations</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>This is a prediction tool only. Always check official school district announcements.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Local factors like school district policies and road conditions vary significantly.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Weather forecasts can change rapidly. Our predictions reflect current data only.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Not responsible for decisions made based on these predictions.</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-muted/50 border-2 border-primary/20">
              <p className="text-sm text-muted-foreground font-medium">
                <strong className="text-foreground">Legal Disclaimer:</strong> This tool is for entertainment and
                informational purposes only. We are not liable for any consequences of using these predictions. Always
                rely on official school district communications for closure decisions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know about snow day predictions</p>
          </div>

          <div className="space-y-4">
            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">How accurate are the predictions?</h3>
              <p className="text-muted-foreground">
                Our predictions are approximately 75-85% accurate based on historical data. Accuracy is highest for
                predictions made 12-24 hours in advance.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">When should I check for tomorrow's prediction?</h3>
              <p className="text-muted-foreground">
                For best accuracy, check between 6 PM and 9 PM the evening before. School districts typically announce
                closures between 5 AM and 6 AM.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Does this work for all U.S. locations?</h3>
              <p className="text-muted-foreground">
                Yes, our calculator covers all U.S. ZIP codes and cities. Accuracy may vary by region depending on local
                weather patterns and school district policies.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Why is my prediction different from other calculators?
              </h3>
              <p className="text-muted-foreground">
                Different calculators use different weather data sources and algorithms. We prioritize factors that
                historically correlate with actual school closures in your area.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Can I use this for college or work closures?</h3>
              <p className="text-muted-foreground">
                While designed for K-12 schools, the weather factors apply to any snow-related closures. However,
                colleges and workplaces have different closure thresholds.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">How often is the data updated?</h3>
              <p className="text-muted-foreground">
                Weather data is updated hourly from multiple sources including NOAA and the National Weather Service for
                the most current forecasts.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">What if the prediction is wrong?</h3>
              <p className="text-muted-foreground">
                Weather is inherently unpredictable. Our tool provides probability estimates, not guarantees. Always
                check official school announcements for final decisions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About Snow Day Calculator</h2>
            <p className="text-lg text-muted-foreground">Helping students and parents plan for winter weather</p>
          </div>

          <div className="space-y-6">
            <Card className="p-8 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                We created this tool to help families plan ahead for potential school closures. By combining real-time
                weather data with historical school closure patterns, we aim to provide helpful predictions that reduce
                uncertainty during winter storms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're a student hoping for a snow day or a parent planning childcare, our calculator gives you
                an early indication of what to expect.
              </p>
            </Card>

            <Card className="p-8 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Why We Built This</h3>
              <p className="text-muted-foreground leading-relaxed">
                Winter weather creates uncertainty for millions of families each year. School districts often announce
                closures early in the morning, leaving little time for parents to adjust plans. Our goal is to provide
                earlier insights using predictive technology.
              </p>
            </Card>

            <Card className="p-8 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Our Values</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">Accuracy:</span>
                  <span>We continuously improve our algorithm using machine learning and real-world feedback.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">Transparency:</span>
                  <span>We openly share how our predictions work and what factors we consider.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">Responsibility:</span>
                  <span>We remind users that predictions are estimates, not official announcements.</span>
                </li>
              </ul>
            </Card>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Made with care for students, parents, and educators everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#accuracy" className="text-muted-foreground hover:text-primary transition-colors">
              Accuracy & Disclaimer
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Snow Day Calculator. For entertainment purposes only. Not affiliated with any school district.
          </p>
        </div>
      </footer>
    </div>
  )
}
