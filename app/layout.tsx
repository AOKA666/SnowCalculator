import type React from "react"
import type { Metadata } from "next"
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
    "Check your snow day probability based on weather forecasts. Accurate predictions for school closures across the United States. Enter your ZIP code or city to get instant results.",
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
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Hreflang tags for multilingual SEO */}
        {/* Removed hreflang tags as they are not needed for snow day calculator */}

        {/* Additional meta tags for better SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
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
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
