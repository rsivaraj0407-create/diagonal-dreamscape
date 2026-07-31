import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeCard } from "@/components/anime-card";
import type { AnimeCard as A } from "@/lib/anime.functions";

export function AnimeRow({
  title,
  subtitle,
  data,
  loading,
  error,
}: {
  title: string;
  subtitle?: string;
  data?: A[];
  loading?: boolean;
  error?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.85), behavior: "smooth" });

  return (
    <section className="mb-16">
      <div className="mb-5 flex items-end gap-6">
        <div>
          <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/50 via-border to-transparent" />
        <div className="hidden gap-2 md:flex">
          <button onClick={() => scroll(-1)} aria-label="Scroll left" className="glass rounded-full p-2 hover:text-cyan">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll(1)} aria-label="Scroll right" className="glass rounded-full p-2 hover:text-cyan">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : (
        <div ref={ref} className="hide-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
          {data?.map((a, i) => (
            <div key={a.id} className="w-[46%] shrink-0 snap-start sm:w-[30%] md:w-[19%] lg:w-[13.4%]">
              <AnimeCard anime={a} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
