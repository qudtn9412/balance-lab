import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const supabase = createPublicClient();
  const { data: games } = await supabase
    .from("balance_games")
    .select("slug, created_at")
    .eq("status", "published");

  const gameEntries: MetadataRoute.Sitemap = (games ?? []).map((game) => ({
    url: `${siteUrl}/games/${game.slug}`,
    lastModified: game.created_at,
  }));

  return [
    { url: siteUrl, changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/rankings`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/games/new`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    ...gameEntries,
  ];
}
