import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Filter, Loader2, Search } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { AnimeCard } from "@/components/anime-card";
import { animeGenres, libraryAnime } from "@/lib/anime.functions";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Anime Library — Browse by genre & status | OtakuStream" },
      {
        name: "description",
        content:
          "Browse thousands of anime by genre, airing status and rating, then jump straight to the streaming platform carrying each title.",
      },
      { property: "og:title", content: "Anime Library — Browse by genre & status" },
      { property: "og:description", content: "Filter anime by genre, status and score, and find where each one streams." },
    ],
  }),
  component: LibraryPage,
});

const STATUSES = [
  { value: undefined, label: "All" },
  { value: "airing", label: "Airing" },
  { value: "complete", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
] as const;

const SORTS = [
  { value: "popularity", label: "Most popular" },
  { value: "score", label: "Highest rated" },
  { value: "start_date", label: "Newest" },
] as const;

function LibraryPage() {
  const [genre, setGenre] = useState<string | undefined>();
  const [status, setStatus] = useState<"airing" | "complete" | "upcoming" | undefined>();
  const [sort, setSort] = useState<"popularity" | "score" | "start_date">("popularity");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");

  const genresFn = useServerFn(animeGenres);
  const libFn = useServerFn(libraryAnime);

  const genres = useQuery({ queryKey: ["genres"], queryFn: () => genresFn(), staleTime: 60 * 60 * 1000 });
  const list = useQuery({
    queryKey: ["library", genre, status, sort, page, query],
    queryFn: () => libFn({ data: { genre, status, sort, page, q: query || undefined } }),
    staleTime: 5 * 60 * 1000,
  });

  const reset = () => setPage(1);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          Anime <span className="text-gradient">Library</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Filter by genre, status and rating — every title links to its live streaming availability.
        </p>

        <div className="glass mt-8 rounded-2xl p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(q.trim());
              reset();
            }}
            className="relative mb-5"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by title…"
              aria-label="Filter library by title"
              className="w-full rounded-xl border border-border/70 bg-background/50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="mr-1 inline-flex items-center gap-1 text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Status
            </span>
            {STATUSES.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setStatus(s.value);
                  reset();
                }}
                className={`rounded-full px-3 py-1.5 transition ${
                  status === s.value ? "bg-primary text-primary-foreground glow-primary" : "glass hover:text-cyan"
                }`}
              >
                {s.label}
              </button>
            ))}
            <span className="ml-4 mr-1 text-muted-foreground">Sort</span>
            {SORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setSort(s.value);
                  reset();
                }}
                className={`rounded-full px-3 py-1.5 transition ${
                  sort === s.value ? "bg-cyan/20 text-cyan" : "glass hover:text-cyan"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setGenre(undefined);
                reset();
              }}
              className={`rounded-full px-3 py-1.5 transition ${
                !genre ? "bg-primary text-primary-foreground" : "glass hover:text-cyan"
              }`}
            >
              All genres
            </button>
            {genres.data?.genres.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setGenre(g.id);
                  reset();
                }}
                className={`rounded-full px-3 py-1.5 transition ${
                  genre === g.id ? "bg-primary text-primary-foreground" : "glass hover:text-cyan"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {list.data?.error && <p className="mt-6 text-sm text-destructive">{list.data.error}</p>}

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {list.isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-card" />
              ))
            : list.data?.results.map((a, i) => <AnimeCard key={a.id} anime={a} index={i} />)}
        </div>

        {!list.isLoading && list.data?.results.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">Nothing matches those filters.</p>
        )}

        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            disabled={page === 1 || list.isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="glass rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Previous
          </button>
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            {list.isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Page {page}
          </span>
          <button
            disabled={!list.data?.hasNext || list.isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow-primary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
