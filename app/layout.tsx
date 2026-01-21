import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Snow Day Calculator - Will School Be Closed Tomorrow?",
    template: "%s | Snow Day Calculator",
  },
  description:
    "Check the probability of school closures tomorrow due to snow, ice, or extreme weather. Get accurate snow day predictions by city in seconds.",
  keywords: [
    "snow day calculator",
    "snow day predictor",
    "will it snow",
    "school closure",
    "snow day probability",
    "weather forecast",
    "snow prediction",
    "school snow day",
    "winter weather",
    "snow day chance",
  ],
  authors: [{ name: "Snow Day Calculator Team" }],
  creator: "Snow Day Calculator Team",
  publisher: "Snow Day Calculator Team",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://snowday-calc.vercel.app",
    siteName: "Snow Day Calculator",
    title: "Snow Day Calculator - Will School Be Closed Tomorrow?",
    description:
      "Check your snow day probability based on weather forecasts. Get instant predictions for your location.",
    images: [
      {
        url: "/calcicon.png",
        width: 1200,
        height: 630,
        alt: "Snow Day Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snow Day Calculator - Will School Be Closed Tomorrow?",
    description: "Check your snow day probability based on weather forecasts.",
    images: ["/calcicon.png"],
  },
  alternates: {
    canonical: "https://snowday-calc.vercel.app",
  },
  icons: {
    icon: "/calcicon.png",
    shortcut: "/calcicon.png",
    apple: "/calcicon.png",
  },
  manifest: "/manifest.json",
  generator: "v0.app",
}

const navLinks = [
  { href: "/", label: "Calculator" },
  { href: "/city", label: "City" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
]

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold text-foreground/90 transition hover:text-foreground"
        >
          Snow Day Calculator
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1 transition hover:bg-primary/10 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5KQ6DTB5');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-H057T8E0PC"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-H057T8E0PC');`,
          }}
        />
        {/* End Google Analytics */}

        {/* Hreflang tags for multilingual SEO */}
        {/* Removed hreflang tags as they are not needed for snow day calculator */}

        {/* Additional meta tags for better SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Ahrefs Analytics */}
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="U4LjLOERG3F/+QA05CzwsQ"
          async
        />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Snow Day Calc" />

        {/* Structured data for better search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Snow Day Calculator",
              description:
                "Check your snow day probability based on weather forecasts. Accurate predictions for school closures.",
              url: "https://snowday-calc.vercel.app",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Snow Day Probability Calculator",
                "Weather-based Predictions",
                "School Closure Estimates",
                "ZIP Code Search",
              ],
              inLanguage: "en",
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <SiteHeader />

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5KQ6DTB5"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <Suspense fallback={<div>Loading...</div>}>
          <main className="min-h-screen pt-20">{children}</main>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
