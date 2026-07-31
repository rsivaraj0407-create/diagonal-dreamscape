import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, Play, Star } from "lucide-react";
import { useState } from "react";

import { animeTrailer, type AnimeCard as A } from "@/lib/anime.functions";
import { TrailerModal } from "@/components/trailer-modal";
import { useWatchlist } from "@/hooks/use-watchlist";

export function AnimeCard({ anime, index = 0 }: { anime: A; index?: number }) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const trailerFn = useServerFn(animeTrailer);
  const trailer = useQuery({
    queryKey: ["trailer", anime.id],
    queryFn: () => trailerFn({ data: { id: anime.id } }),
    enabled: trailerOpen,
    staleTime: 10 * 60 * 1000,
  });

  const { signedIn, isSaved, toggle } = useWatchlist();
  const saved = isSaved(anime.id);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
        className="group relative"
      >
        <Link
          to="/anime/$id"
          params={{ id: String(anime.id) }}
          className="neon-border relative block overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-1.5 hover:glow-primary"
        >
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            {anime.image && (
              <img
                src={anime.image}
                alt={anime.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
          </div>

          {anime.score != null && (
            <span className="glass-strong absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-cyan">
              <Star className="h-3 w-3 fill-current" /> {anime.score.toFixed(1)}
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent p-3">
            <h3 className="line-clamp-2 text-sm font-semibold">{anime.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
              {anime.year && <span>{anime.year}</span>}
              {anime.type && <span>· {anime.type}</span>}
              {anime.episodes ? <span>· {anime.episodes} eps</span> : null}
            </div>
            <div className="mt-1.5 hidden flex-wrap gap-1 group-hover:flex">
              {anime.genres.slice(0, 2).map((g) => (
                <span key={g} className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px]">
                  {g}
                </span>
              ))}
              {anime.status && (
                <span className="rounded-full border border-cyan/40 bg-cyan/10 px-2 py-0.5 text-[10px] text-cyan">
                  {anime.status.replace("Currently ", "")}
                </span>
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/25 via-transparent to-cyan/20" />
          </div>
        </Link>

        <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setTrailerOpen(true)}
            aria-label={`Play ${anime.title} trailer`}
            className="glass-strong rounded-full p-2 text-foreground transition hover:text-cyan"
          >
            <Play className="h-3.5 w-3.5" />
          </button>
          {signedIn ? (
            <button
              onClick={() => toggle.mutate({ id: anime.id, title: anime.title, image: anime.image })}
              aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
              className={`glass-strong rounded-full p-2 transition ${saved ? "text-cyan" : "hover:text-cyan"}`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
            </button>
          ) : (
            <Link to="/auth" aria-label="Sign in to save" className="glass-strong rounded-full p-2 hover:text-cyan">
              <Bookmark className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </motion.div>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={anime.title}
        embedUrl={trailer.data?.embedUrl ?? null}
        loading={trailer.isLoading}
      />
    </>
  );
}
