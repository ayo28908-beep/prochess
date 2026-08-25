import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

type NigeriaEntry = { name: string };

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://prochess.ng";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/live`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/players`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/dashboard`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/sign-in`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/sign-up`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Every Nigerian player from the official FIDE list (served from /public).
  let players: NigeriaEntry[] = [];
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "public/fide-nigeria.json"),
      "utf8"
    );
    players = (JSON.parse(raw).players ?? []) as NigeriaEntry[];
  } catch {
    players = [];
  }

  const playerRoutes: MetadataRoute.Sitemap = players.map((p) => ({
    url: `${base}/players/${encodeURIComponent(p.name)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...playerRoutes];
}
