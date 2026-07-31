import type { AnimeCard, AnimeDetail, AnimeVideos } from "./anime-types";

// Public anime data via Jikan (MyAnimeList). No API key required.
export const JIKAN = "https://api.jikan.moe/v4";

export function mapCard(a: any): AnimeCard {
  return {
    id: a.mal_id,
    title: a.title_english || a.title,
    image:
      a.images?.webp?.large_image_url ||
      a.images?.jpg?.large_image_url ||
      a.images?.jpg?.image_url,
    score: a.score ?? null,
    year: a.year ?? a.aired?.prop?.from?.year ?? null,
    type: a.type ?? null,
    episodes: a.episodes ?? null,
    status: a.status ?? null,
    genres: (a.genres ?? []).map((g: any) => g.name).slice(0, 4),
    synopsis: a.synopsis ?? null,
    members: a.members ?? null,
    rank: a.rank ?? null,
  };
}

export function mapDetail(a: any): AnimeDetail {
  return {
    ...mapCard(a),
    genres: (a.genres ?? []).map((g: any) => g.name),
    titleJp: a.title_japanese ?? null,
    studios: (a.studios ?? []).map((s: any) => s.name),
    trailer: a.trailer?.embed_url ?? null,
    banner: a.images?.webp?.large_image_url || null,
    streaming: (a.streaming ?? []).map((s: any) => ({ name: s.name, url: s.url })),
    themesOpening: a.theme?.openings ?? [],
    themesEnding: a.theme?.endings ?? [],
    airedFrom: a.aired?.from ?? null,
    duration: a.duration ?? null,
    source: a.source ?? null,
    rating: a.rating ?? null,
  };
}

export function mapVideos(d: any): AnimeVideos {
  const promos = (d?.promo ?? []).map((p: any) => ({
    title: p.title ?? "Promo",
    embedUrl: p.trailer?.embed_url ?? "",
    thumb: p.trailer?.images?.large_image_url ?? null,
  }));
  const music = (d?.music_videos ?? []).map((m: any) => ({
    title: m.title ?? "Theme",
    embedUrl: m.video?.embed_url ?? "",
    thumb: m.video?.images?.large_image_url ?? null,
  }));
  const clean = (list: AnimeVideos["promos"]) => list.filter((v) => v.embedUrl);
  return { promos: clean(promos).slice(0, 8), music: clean(music).slice(0, 8) };
}

export async function jikanFetch(path: string): Promise<any | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${JIKAN}${path}`);
      if (res.ok) return await res.json();
      if (res.status === 429 || res.status >= 500) {
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

export function dedupe(list: AnimeCard[]): AnimeCard[] {
  const seen = new Set<number>();
  return list.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
}

export async function jikanList(path: string) {
  const json = await jikanFetch(path);
  return {
    results: dedupe(((json?.data ?? []) as any[]).map(mapCard)),
    hasNext: Boolean(json?.pagination?.has_next_page),
    error: json ? null : "Anime data is temporarily unavailable. Please retry.",
  };
}
