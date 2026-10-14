import type { MetadataRoute } from "next"
import { projects } from "@/lib/portfolio-data"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sairithwikreddy.vercel.app"
  return [
    { url: base, priority: 1, changeFrequency: "monthly" },
    { url: `${base}/projects`, priority: 0.9, changeFrequency: "monthly" },
    ...projects.map((project) => ({ url: `${base}/projects/${project.slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
    { url: `${base}/now`, priority: 0.5, changeFrequency: "monthly" },
  ]
}

