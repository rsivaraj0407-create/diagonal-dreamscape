import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type { AnimeCard, AnimeDetail, AnimeVideo, AnimeVideos, StreamingLink } from "./anime-types";

export const searchAnime = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string }) => z.object({ q: z.string().trim().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { jikanList } = await import("./anime.server");
    return jikanList(`/anime?q=${encodeURIComponent(data.q)}&limit=24&order_by=popularity`);
  });

export const suggestAnime = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string }) => z.object({ q: z.string().trim().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { jikanList } = await import("./anime.server");
    return jikanList(`/anime?q=${encodeURIComponent(data.q)}&limit=8&order_by=members&sort=desc`);
  });

export const topAnime = createServerFn({ method: "GET" }).handler(async () => {
  const { jikanList } = await import("./anime.server");
  return jikanList(`/top/anime?limit=14&filter=bypopularity`);
});

export const seasonalAnime = createServerFn({ method: "GET" }).handler(async () => {
  const { jikanList } = await import("./anime.server");
  return jikanList(`/seasons/now?limit=14`);
});

export const trendingAiring = createServerFn({ method: "GET" }).handler(async () => {
  const { jikanList } = await import("./anime.server");
  return jikanList(`/top/anime?limit=14&filter=airing`);
});

export const weeklyTopTen = createServerFn({ method: "GET" }).handler(async () => {
  const { jikanList } = await import("./anime.server");
  return jikanList(`/top/anime?limit=10&filter=airing&type=tv`);
});

export const upcomingAnime = createServerFn({ method: "GET" }).handler(async () => {
  const { jikanList } = await import("./anime.server");
  return jikanList(`/seasons/upcoming?limit=14&sfw=true`);
});

export const libraryAnime = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { page?: number; genre?: string; status?: string; sort?: string; q?: string }) =>
      z
        .object({
          page: z.coerce.number().int().min(1).max(50).default(1),
          genre: z.string().max(10).optional(),
          status: z.enum(["airing", "complete", "upcoming"]).optional(),
          sort: z.enum(["popularity", "score", "start_date"]).default("popularity"),
          q: z.string().trim().max(80).optional(),
        })
        .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { jikanList } = await import("./anime.server");
    const params = new URLSearchParams({
      limit: "24",
      page: String(data.page),
      order_by: data.sort,
      sort: data.sort === "popularity" ? "asc" : "desc",
    });
    if (data.genre) params.set("genres", data.genre);
    if (data.status) params.set("status", data.status);
    if (data.q) params.set("q", data.q);
    return jikanList(`/anime?${params.toString()}`);
  });

export const animeGenres = createServerFn({ method: "GET" }).handler(async () => {
  const { jikanFetch } = await import("./anime.server");
  const json = await jikanFetch(`/genres/anime?filter=genres`);
  const genres = ((json?.data ?? []) as any[])
    .filter((g) => g.count > 200)
    .map((g) => ({ id: String(g.mal_id), name: g.name as string }))
    .slice(0, 28);
  return { genres };
});

export const animeById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const { jikanFetch, mapDetail } = await import("./anime.server");
    const json = await jikanFetch(`/anime/${data.id}/full`);
    if (!json?.data) throw new Error("Anime not found");
    return mapDetail(json.data);
  });

export const animeVideos = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const { jikanFetch, mapVideos } = await import("./anime.server");
    const json = await jikanFetch(`/anime/${data.id}/videos`);
    return mapVideos(json?.data);
  });

export const animeTrailer = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const { jikanFetch } = await import("./anime.server");
    const json = await jikanFetch(`/anime/${data.id}`);
    const a = json?.data;
    return {
      title: (a?.title_english || a?.title || "Trailer") as string,
      embedUrl: (a?.trailer?.embed_url ?? null) as string | null,
    };
  });

export const recommendedFor = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const { jikanFetch, mapCard, dedupe } = await import("./anime.server");
    const json = await jikanFetch(`/anime/${data.id}/recommendations`);
    const entries = ((json?.data ?? []) as any[]).slice(0, 12).map((r) => r.entry);
    return { results: dedupe(entries.map(mapCard)) };
  });
