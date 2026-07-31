import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, Star } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { AnimeRow } from "@/components/anime-row";
import { seasonalAnime, topAnime, upcomingAnime, weeklyTopTen } from "@/lib/anime.functions";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending Anime — Weekly Top 10 & new releases | OtakuStream" },
      {
        name: "description",
        content:
          "The weekly anime top 10, seasonal simulcasts and upcoming premieres — with instant streaming availability for every title.",
      },
      { property: "og:title", content: "Trending Anime — Weekly Top 10 & new releases" },
      { property: "og:description", content: "Weekly top 10 anime charts, new releases and upcoming premieres." },
    ],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const topTenFn = useServerFn(weeklyTopTen);
  const seasonFn = useServerFn(seasonalAnime);
  const upcomingFn = useServerFn(upcomingAnime);
  const popularFn = useServerFn(topAnime);

  const stale = { staleTime: 10 * 60 * 1000 };
  const topTen = useQuery({ queryKey: ["top10"], queryFn: () => topTenFn(), ...stale });
  const season = useQuery({ queryKey: ["season"], queryFn: () => seasonFn(), ...stale });
  const upcoming = useQuery({ queryKey: ["upcoming"], queryFn: () => upcomingFn(), ...stale });
  const popular = useQuery({ queryKey: ["top"], queryFn: () => popularFn(), ...stale });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="flex items-center gap-3 font-display text-4xl font-bold md:text-5xl">
          <Flame className="h-8 w-8 text-cyan" />
          <span>
            Weekly <span className="text-gradient">Top 10</span>
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The most-watched shows airing right now, ranked by live MyAnimeList activity.
        </p>

        <div className="mt-10 space-y-3">
          {topTen.isLoading &&
            Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />)}

          {topTen.data?.results.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                to="/anime/$id"
                params={{ id: String(a.id) }}
                className="glass group flex items-center gap-5 overflow-hidden rounded-2xl p-3 transition hover:glow-primary"
              >
                <span className="w-12 shrink-0 text-center font-display text-4xl font-bold text-gradient">{i + 1}</span>
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {a.image && (
                    <img
                      src={a.image}
                      alt={a.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-lg font-semibold">{a.title}</h2>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.synopsis}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    {a.score != null && (
                      <span className="inline-flex items-center gap-1 text-cyan">
                        <Star className="h-3 w-3 fill-current" /> {a.score.toFixed(1)}
                      </span>
                    )}
                    {a.episodes ? <span>{a.episodes} eps</span> : null}
                    {a.genres.slice(0, 3).map((g) => (
                      <span key={g} className="rounded-full border border-border/60 px-2 py-0.5">{g}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16">
          <AnimeRow
            title="New This Season"
            subtitle="Simulcasts currently rolling out"
            data={season.data?.results}
            loading={season.isLoading}
            error={season.data?.error}
          />
          <AnimeRow
            title="Upcoming Premieres"
            subtitle="Save them before they drop"
            data={upcoming.data?.results}
            loading={upcoming.isLoading}
            error={upcoming.data?.error}
          />
          <AnimeRow
            title="All-Time Popular"
            data={popular.data?.results}
            loading={popular.isLoading}
            error={popular.data?.error}
          />
        </div>
      </main>
    </div>
  );
}
