import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Bookmark, ExternalLink, Music, Play, Star } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { AnimeCard } from "@/components/anime-card";
import { TrailerModal } from "@/components/trailer-modal";
import { animeById, animeVideos, recommendedFor, type AnimeVideo } from "@/lib/anime.functions";
import { tierClass, tierFor, tierLabel } from "@/lib/streaming";
import { useWatchlist } from "@/hooks/use-watchlist";

export const Route = createFileRoute("/anime/$id")({
  component: AnimePage,
});

function AnimePage() {
  const { id } = Route.useParams();
  const numId = Number(id);
  const fetcher = useServerFn(animeById);
  const videosFn = useServerFn(animeVideos);
  const recsFn = useServerFn(recommendedFor);

  const q = useQuery({ queryKey: ["anime", numId], queryFn: () => fetcher({ data: { id: numId } }) });
  const videos = useQuery({
    queryKey: ["videos", numId],
    queryFn: () => videosFn({ data: { id: numId } }),
    staleTime: 30 * 60 * 1000,
  });
  const recs = useQuery({
    queryKey: ["recs", numId],
    queryFn: () => recsFn({ data: { id: numId } }),
    staleTime: 30 * 60 * 1000,
  });

  const { signedIn, isSaved, toggle } = useWatchlist();
  const saved = isSaved(numId);
  const [video, setVideo] = useState<AnimeVideo | null>(null);

  if (q.isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="h-96 animate-pulse rounded-2xl bg-card" />
        </div>
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="text-muted-foreground">Couldn't load this anime.</p>
          <Link to="/" className="mt-4 inline-block text-primary underline">Back to search</Link>
        </div>
      </div>
    );
  }
  const a = q.data;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Diagonal cinematic banner */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 animate-kenburns"
          style={{ backgroundImage: a.banner ? `url(${a.banner})` : undefined }}
          aria-hidden
        />
        <div className="absolute inset-0 grid-lines opacity-30" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/85 to-background" aria-hidden />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-[290px_1fr]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="diagonal-clip-tr overflow-hidden rounded-2xl glass-strong glow-primary">
              {a.image && <img src={a.image} alt={a.title} className="w-full object-cover" />}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <Link to="/" className="mb-4 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="font-display text-4xl font-bold md:text-5xl">{a.title}</h1>
            {a.titleJp && <p className="mt-1 text-sm text-muted-foreground">{a.titleJp}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {a.score != null && (
                <span className="inline-flex items-center gap-1 text-cyan">
                  <Star className="h-4 w-4 fill-current" /> {a.score.toFixed(1)}
                </span>
              )}
              {a.year && <span>{a.year}</span>}
              {a.type && <span>{a.type}</span>}
              {a.episodes && <span>{a.episodes} eps</span>}
              {a.duration && <span>{a.duration}</span>}
              {a.status && <span className="text-foreground">{a.status}</span>}
              {a.rating && <span>{a.rating}</span>}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {a.genres.map((g) => (
                <span key={g} className="glass rounded-full px-3 py-1 text-xs">{g}</span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {a.trailer && (
                <button
                  onClick={() => setVideo({ title: `${a.title} — Trailer`, embedUrl: a.trailer!, thumb: null })}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-primary transition-transform hover:scale-[1.03]"
                >
                  <Play className="h-4 w-4" /> Watch trailer
                </button>
              )}
              {signedIn ? (
                <button
                  onClick={() => toggle.mutate({ id: a.id, title: a.title, image: a.image })}
                  disabled={toggle.isPending}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    saved ? "bg-cyan/20 text-cyan" : "glass hover:text-cyan"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                  {saved ? "In your list" : "Add to my list"}
                </button>
              ) : (
                <Link to="/auth" className="glass rounded-xl px-4 py-2.5 text-sm font-semibold hover:text-cyan">
                  Sign in to save
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 md:grid-cols-[1fr_360px]">
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Synopsis</h2>
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
            {a.synopsis || "No synopsis available."}
          </p>

          {(videos.data?.promos.length || videos.data?.music.length) ? (
            <div className="mt-10">
              <h2 className="mb-4 font-display text-xl font-bold">Videos</h2>
              {videos.data.promos.length > 0 && (
                <>
                  <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Promos & trailers</p>
                  <VideoGrid items={videos.data.promos} onPlay={setVideo} />
                </>
              )}
              {videos.data.music.length > 0 && (
                <>
                  <p className="mb-2 mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <Music className="h-3.5 w-3.5" /> Opening & ending themes
                  </p>
                  <VideoGrid items={videos.data.music} onPlay={setVideo} />
                </>
              )}
            </div>
          ) : null}

          {(a.themesOpening.length > 0 || a.themesEnding.length > 0) && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {a.themesOpening.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-cyan">Openings</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {a.themesOpening.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              )}
              {a.themesEnding.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-cyan">Endings</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {a.themesEnding.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {recs.data?.results.length ? (
            <div className="mt-12">
              <h2 className="mb-4 font-display text-xl font-bold">More like this</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {recs.data.results.slice(0, 8).map((r, i) => (
                  <AnimeCard key={r.id} anime={r} index={i} />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <div className="glass neon-border rounded-2xl p-5">
            <h3 className="mb-1 font-display text-lg font-bold">Where to watch</h3>
            <p className="mb-4 text-xs text-muted-foreground">Availability can vary by region.</p>
            {a.streaming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No official streaming platform reported for this title yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {a.streaming.map((s) => {
                  const tier = tierFor(s.name);
                  return (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 text-sm font-medium transition hover:border-primary/60 hover:bg-primary/10"
                      >
                        <span className="min-w-0 flex-1 truncate">{s.name}</span>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${tierClass[tier]}`}>
                          {tierLabel[tier]}
                        </span>
                        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-5 text-sm">
            <h3 className="mb-3 font-display text-lg font-bold">Details</h3>
            <dl className="space-y-2 text-muted-foreground">
              {a.studios.length > 0 && <Row label="Studios" value={a.studios.join(", ")} />}
              {a.source && <Row label="Source" value={a.source} />}
              {a.status && <Row label="Status" value={a.status} />}
              {a.episodes ? <Row label="Episodes" value={String(a.episodes)} /> : null}
              {a.members ? <Row label="Members" value={a.members.toLocaleString()} /> : null}
              {a.rank ? <Row label="MAL rank" value={`#${a.rank}`} /> : null}
            </dl>
          </div>
        </aside>
      </main>

      <TrailerModal
        open={!!video}
        onClose={() => setVideo(null)}
        title={video?.title ?? a.title}
        embedUrl={video?.embedUrl ?? null}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}

function VideoGrid({ items, onPlay }: { items: AnimeVideo[]; onPlay: (v: AnimeVideo) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((v) => (
        <button
          key={v.embedUrl + v.title}
          onClick={() => onPlay(v)}
          className="group relative overflow-hidden rounded-xl border border-border/60 bg-card text-left"
        >
          <div className="aspect-video bg-muted">
            {v.thumb && (
              <img src={v.thumb} alt={v.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="glass-strong rounded-full p-3">
              <Play className="h-4 w-4 text-cyan" />
            </span>
          </div>
          <p className="truncate px-2 py-2 text-xs">{v.title}</p>
        </button>
      ))}
    </div>
  );
}
