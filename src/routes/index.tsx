import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Play, Search, Sparkles, TrendingUp } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { AnimeCard } from "@/components/anime-card";
import { AnimeRow } from "@/components/anime-row";
import { TrailerModal } from "@/components/trailer-modal";
import { animeTrailer, homeFeed, searchAnime } from "@/lib/anime.functions";
import heroImg from "@/assets/hero-anime.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OtakuStream — Where is your anime streaming?" },
      {
        name: "description",
        content:
          "Search any anime and instantly see which OTT platform streams it — Crunchyroll, Netflix, Hulu, Disney+, Prime Video and more. Trailers, trending charts and watchlists included.",
      },
      { property: "og:title", content: "OtakuStream — Where is your anime streaming?" },
      {
        property: "og:description",
        content: "Instant anime streaming availability, trailers, trending charts and your personal watchlist.",
      },
    ],
  }),
  component: Home,
});

const PLATFORMS = ["Crunchyroll", "Netflix", "Hulu", "Disney+", "Prime Video", "HIDIVE", "Max", "Muse Asia"];

function Home() {
  const [q, setQ] = useState("");
  const search = useServerFn(searchAnime);
  const searchMutation = useMutation({ mutationFn: (query: string) => search({ data: { q: query } }) });

  const topFn = useServerFn(topAnime);
  const seasonFn = useServerFn(seasonalAnime);
  const airingFn = useServerFn(trendingAiring);
  const upcomingFn = useServerFn(upcomingAnime);
  const trailerFn = useServerFn(animeTrailer);

  const stale = { staleTime: 10 * 60 * 1000 };
  const top = useQuery({ queryKey: ["top"], queryFn: () => topFn(), ...stale });
  const season = useQuery({ queryKey: ["season"], queryFn: () => seasonFn(), ...stale });
  const airing = useQuery({ queryKey: ["airing"], queryFn: () => airingFn(), ...stale });
  const upcoming = useQuery({ queryKey: ["upcoming"], queryFn: () => upcomingFn(), ...stale });

  // Rotating hero spotlight from the currently trending titles
  const spotlight = (airing.data?.results ?? []).slice(0, 5);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (spotlight.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % spotlight.length), 6500);
    return () => clearInterval(t);
  }, [spotlight.length]);
  const featured = spotlight[slide];

  const [trailerOpen, setTrailerOpen] = useState(false);
  const trailer = useQuery({
    queryKey: ["trailer", featured?.id],
    queryFn: () => trailerFn({ data: { id: featured!.id } }),
    enabled: trailerOpen && !!featured,
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = q.trim();
    if (!value) return;
    searchMutation.mutate(value);
  }

  const results = searchMutation.data?.results;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        {/* animated backdrop from the featured title */}
        <div className="absolute inset-0" aria-hidden>
          <AnimatePresence mode="wait">
            <motion.div
              key={featured?.id ?? "fallback"}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.35, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 bg-cover bg-center animate-kenburns"
              style={{ backgroundImage: `url(${featured?.image ?? heroImg})` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 grid-lines opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/20 to-transparent animate-glow-pulse" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.15fr_1fr] md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col justify-center"
          >
            <span className="glass mb-5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" /> streaming radar online
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.03] md:text-7xl">
              Find where <span className="text-gradient">any anime</span> streams.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              One search. Every platform. Crunchyroll, Netflix, Hulu, Disney+, Prime Video and beyond — plus trailers,
              trending charts and a watchlist that follows you.
            </p>

            <form onSubmit={onSubmit} className="relative mt-8 max-w-xl">
              <div className="absolute -inset-0.5 rounded-2xl bg-[var(--gradient-hero)] opacity-40 blur-md" aria-hidden />
              <div className="glass-strong relative flex items-center rounded-2xl">
                <Search className="pointer-events-none ml-4 h-5 w-5 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search Attack on Titan, Jujutsu Kaisen, One Piece…"
                  aria-label="Search anime"
                  className="w-full bg-transparent py-4 pl-3 pr-2 text-base outline-none placeholder:text-muted-foreground/70"
                />
                <button
                  type="submit"
                  className="m-2 shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-primary transition-transform hover:scale-[1.04]"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {PLATFORMS.map((p) => (
                <span key={p} className="glass rounded-full px-3 py-1">{p}</span>
              ))}
            </div>
          </motion.div>

          {/* Featured spotlight card */}
          <div className="relative flex items-center">
            <div className="absolute -inset-8 diagonal-slash opacity-30 blur-3xl animate-glow-pulse" aria-hidden />
            <AnimatePresence mode="wait">
              {featured ? (
                <motion.div
                  key={featured.id}
                  initial={{ opacity: 0, x: 40, rotate: 1 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-full animate-float"
                >
                  <div className="diagonal-clip-tr relative overflow-hidden rounded-3xl glass-strong glow-primary">
                    <img src={featured.image} alt={featured.title} className="h-[420px] w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-cyan">Now airing spotlight</span>
                      <h2 className="mt-1 line-clamp-2 font-display text-2xl font-bold">{featured.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{featured.synopsis}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => setTrailerOpen(true)}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow-primary hover:scale-[1.03] transition-transform"
                        >
                          <Play className="h-4 w-4" /> Watch trailer
                        </button>
                        <Link
                          to="/anime/$id"
                          params={{ id: String(featured.id) }}
                          className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold hover:text-cyan"
                        >
                          Where to watch
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center gap-2">
                    {spotlight.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => setSlide(i)}
                        aria-label={`Show ${s.title}`}
                        className={`h-1.5 rounded-full transition-all ${i === slide ? "w-8 bg-primary" : "w-3 bg-border"}`}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="diagonal-clip-tr h-[420px] w-full animate-pulse rounded-3xl bg-card" />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-16 -mt-8 diagonal-clip-bl bg-gradient-to-r from-primary/40 via-cyan/30 to-violet/40" />
      </section>

      <main className="mx-auto max-w-7xl px-6 pb-24">
        {(searchMutation.isPending || results) && (
          <section className="mb-16">
            <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold">
              <Sparkles className="h-5 w-5 text-cyan" />
              {searchMutation.isPending ? "Scanning platforms…" : `Results for "${q}"`}
            </h2>
            {results && results.length === 0 && (
              <p className="text-muted-foreground">No matches. Try another title.</p>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {results?.map((a, i) => (
                <AnimeCard key={a.id} anime={a} index={i} />
              ))}
            </div>
          </section>
        )}

        <AnimeRow
          title="Trending Now"
          subtitle="Most-watched shows airing this week"
          data={airing.data?.results}
          loading={airing.isLoading}
          error={airing.data?.error}
        />
        <AnimeRow
          title="This Season"
          subtitle="Fresh simulcasts landing on OTT platforms"
          data={season.data?.results}
          loading={season.isLoading}
          error={season.data?.error}
        />
        <AnimeRow
          title="All-Time Popular"
          subtitle="The classics everyone streams"
          data={top.data?.results}
          loading={top.isLoading}
          error={top.data?.error}
        />
        <AnimeRow
          title="Coming Soon"
          subtitle="Upcoming premieres to add to your list"
          data={upcoming.data?.results}
          loading={upcoming.isLoading}
          error={upcoming.data?.error}
        />

        <div className="glass neon-border flex flex-col items-center justify-between gap-4 rounded-2xl p-8 md:flex-row">
          <div>
            <h3 className="font-display text-2xl font-bold">Explore the full library</h3>
            <p className="mt-1 text-sm text-muted-foreground">Filter 30,000+ titles by genre, status and rating.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/library" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-primary">
              Browse library
            </Link>
            <Link to="/trending" className="glass inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold hover:text-cyan">
              <TrendingUp className="h-4 w-4" /> Top 10
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 py-10 text-center text-sm text-muted-foreground">
        OtakuStream · Anime data via MyAnimeList/Jikan · Not affiliated with any streaming service
      </footer>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={featured?.title ?? "Trailer"}
        embedUrl={trailer.data?.embedUrl ?? null}
        loading={trailer.isLoading}
      />
    </div>
  );
}
