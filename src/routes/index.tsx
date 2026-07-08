import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Play } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { AnimeCard } from "@/components/anime-card";
import { searchAnime, topAnime, seasonalAnime } from "@/lib/anime.functions";
import heroImg from "@/assets/hero-anime.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const search = useServerFn(searchAnime);
  const searchMutation = useMutation({ mutationFn: (query: string) => search({ data: { q: query } }) });

  const topFn = useServerFn(topAnime);
  const seasonFn = useServerFn(seasonalAnime);
  const top = useQuery({ queryKey: ["top"], queryFn: () => topFn(), staleTime: 5 * 60 * 1000 });
  const season = useQuery({ queryKey: ["season"], queryFn: () => seasonFn(), staleTime: 5 * 60 * 1000 });

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

      {/* HERO with diagonal split */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div className="relative z-10 flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> anime · streaming radar
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              Find where <span className="text-gradient">any anime</span> streams.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Instantly discover which OTT platforms — Crunchyroll, Netflix, Hulu, Disney+, Prime Video and more — carry the series you want to watch.
            </p>

            <form onSubmit={onSubmit} className="relative mt-8 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Attack on Titan, Jujutsu Kaisen, One Piece…"
                className="w-full rounded-xl border border-border/70 bg-card/60 py-4 pl-12 pr-32 text-base outline-none backdrop-blur-md placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-primary transition-transform hover:scale-[1.03]"
              >
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {["Crunchyroll", "Netflix", "Hulu", "Disney+", "Prime Video", "HIDIVE"].map((p) => (
                <span key={p} className="rounded-full border border-border/60 bg-card/50 px-3 py-1">{p}</span>
              ))}
            </div>
          </div>

          {/* Diagonal hero image */}
          <div className="relative">
            <div className="absolute -inset-6 diagonal-slash opacity-40 blur-3xl" aria-hidden />
            <div className="relative diagonal-clip-tr overflow-hidden rounded-3xl border border-border/60 shadow-[var(--shadow-glow)]">
              <img src={heroImg} alt="Anime hero art" width={1600} height={1200} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-full border border-border/60 bg-background/70 px-4 py-2 backdrop-blur-md">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">30,000+ titles indexed</span>
              </div>
            </div>
          </div>
        </div>

        {/* diagonal divider */}
        <div className="h-16 -mt-8 diagonal-clip-bl bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30" />
      </section>

      <main className="mx-auto max-w-7xl px-6 pb-24">
        {/* Search results */}
        {(searchMutation.isPending || results) && (
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold">
              {searchMutation.isPending ? "Searching…" : `Results for "${q}"`}
            </h2>
            {results && results.length === 0 && (
              <p className="text-muted-foreground">No matches. Try another title.</p>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {results?.map((a) => (
                <AnimeCard key={a.id} anime={a} />
              ))}
            </div>
          </section>
        )}

        {/* Trending */}
        <SectionRow title="Trending Now" data={top.data?.results} loading={top.isLoading} />
        <SectionRow title="This Season" data={season.data?.results} loading={season.isLoading} />
      </main>

      <footer className="border-t border-border/60 py-10 text-center text-sm text-muted-foreground">
        OtakuStream · Anime data via MyAnimeList/Jikan · Not affiliated with any streaming service
      </footer>
    </div>
  );
}

function SectionRow({ title, data, loading }: { title: string; data?: any[]; loading: boolean }) {
  return (
    <section className="mb-14">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
        <div className="h-px flex-1 mx-6 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      )}
      {data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {data.map((a) => (
            <AnimeCard key={a.id} anime={a} />
          ))}
        </div>
      )}
    </section>
  );
}
