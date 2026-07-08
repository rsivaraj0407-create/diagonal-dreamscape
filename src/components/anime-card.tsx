import { Link } from "@tanstack/react-router";
import type { AnimeCard as A } from "@/lib/anime.functions";

export function AnimeCard({ anime }: { anime: A }) {
  return (
    <Link
      to="/anime/$id"
      params={{ id: String(anime.id) }}
      className="group relative block overflow-hidden rounded-xl border border-border/60 bg-card transition-transform hover:-translate-y-1"
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        {anime.image && (
          <img
            src={anime.image}
            alt={anime.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent p-3">
        <h3 className="line-clamp-2 text-sm font-semibold">{anime.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          {anime.score != null && <span className="text-neon">★ {anime.score.toFixed(1)}</span>}
          {anime.year && <span>{anime.year}</span>}
          {anime.type && <span>· {anime.type}</span>}
        </div>
      </div>
    </Link>
  );
}
