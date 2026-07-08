import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { listFavorites, removeFavorite } from "@/lib/favorites.functions";

export const Route = createFileRoute("/_authenticated/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const listFn = useServerFn(listFavorites);
  const rmFn = useServerFn(removeFavorite);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["favorites"], queryFn: () => listFn() });
  const rm = useMutation({
    mutationFn: (anime_id: number) => rmFn({ data: { anime_id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="font-display text-4xl font-bold">
          My <span className="text-gradient">Watchlist</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Anime you saved to check on your streaming services.</p>

        {q.isLoading && <p className="mt-10 text-muted-foreground">Loading…</p>}

        {q.data && q.data.length === 0 && (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">You haven't saved anything yet.</p>
            <Link to="/" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Discover anime
            </Link>
          </div>
        )}

        {q.data && q.data.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {q.data.map((f) => (
              <div key={f.id} className="group relative overflow-hidden rounded-xl border border-border/60 bg-card">
                <Link to="/anime/$id" params={{ id: String(f.anime_id) }}>
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    {f.image_url && <img src={f.image_url} alt={f.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold">{f.title}</h3>
                  </div>
                </Link>
                <button
                  onClick={() => rm.mutate(f.anime_id)}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
