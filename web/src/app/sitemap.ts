import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://prochess-lovat.vercel.app";

  const routes = [
    "",
    "/courses",
    "/puzzles",
    "/tournaments",
    "/players",
    "/about",
    "/summer-camp",
    "/live",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}
