import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public anime data via Jikan (MyAnimeList). No API key required.
const JIKAN = "https://api.jikan.moe/v4";

export type AnimeCard = {
  id: number;
  title: string;
  image: string;
  score: number | null;
  year: number | null;
  type: string | null;
  episodes: number | null;
};

export type StreamingLink = { name: string; url: string };

export type AnimeDetail = AnimeCard & {
  synopsis: string | null;
  status: string | null;
  genres: string[];
  studios: string[];
  trailer: string | null;
  banner: string | null;
  streaming: StreamingLink[];
};

function mapCard(a: any): AnimeCard {
  return {
    id: a.mal_id,
    title: a.title_english || a.title,
    image: a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url || a.images?.jpg?.image_url,
    score: a.score ?? null,
    year: a.year ?? (a.aired?.prop?.from?.year ?? null),
    type: a.type ?? null,
    episodes: a.episodes ?? null,
  };
}

async function jikanFetch(path: string): Promise<any | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${JIKAN}${path}`);
      if (res.ok) return await res.json();
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      return null;
    } catch (e) {
      console.error("Jikan fetch error", path, e);
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return null;
}

export const searchAnime = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string }) => z.object({ q: z.string().trim().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const json = await jikanFetch(`/anime?q=${encodeURIComponent(data.q)}&limit=24&order_by=popularity`);
    const seen = new Set<number>();
    const results = ((json?.data ?? []) as any[])
      .map(mapCard)
      .filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true))) as AnimeCard[];
    return { results, error: json ? null : "Search temporarily unavailable" };
  });



export const topAnime = createServerFn({ method: "GET" }).handler(async () => {
  const json = await jikanFetch(`/top/anime?limit=12&filter=bypopularity`);
  return { results: ((json?.data ?? []) as any[]).map(mapCard) as AnimeCard[], error: json ? null : "Top anime temporarily unavailable" };
});

export const seasonalAnime = createServerFn({ method: "GET" }).handler(async () => {
  const json = await jikanFetch(`/seasons/now?limit=12&sfw=true`);
  return { results: ((json?.data ?? []) as any[]).map(mapCard) as AnimeCard[], error: json ? null : "Seasonal anime temporarily unavailable" };
});

export const animeById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const res = await fetch(`${JIKAN}/anime/${data.id}/full`);
    if (!res.ok) throw new Error("Anime not found");
    const json = await res.json();
    const a = json.data;
    const detail: AnimeDetail = {
      ...mapCard(a),
      synopsis: a.synopsis ?? null,
      status: a.status ?? null,
      genres: (a.genres ?? []).map((g: any) => g.name),
      studios: (a.studios ?? []).map((s: any) => s.name),
      trailer: a.trailer?.embed_url ?? null,
      banner: a.images?.webp?.large_image_url || null,
      streaming: (a.streaming ?? []).map((s: any) => ({ name: s.name, url: s.url })),
    };
    return detail;
  });
