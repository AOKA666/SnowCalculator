import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.willschoolbeclosed.online"
  const routes = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/city", changeFrequency: "weekly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { path: "/faq", changeFrequency: "weekly", priority: 0.7 },
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency as MetadataRoute.SitemapChangeFrequency,
    priority: route.priority,
  }))
}
