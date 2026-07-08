import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, ExternalLink } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { animeById } from "@/lib/anime.functions";
import { addFavorite, listFavorites, removeFavorite } from "@/lib/favorites.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/anime/$id")({
  component: AnimePage,
});

function AnimePage() {
  const { id } = Route.useParams();
  const numId = Number(id);
  const fetcher = useServerFn(animeById);
  const q = useQuery({
    queryKey: ["anime", numId],
    queryFn: () => fetcher({ data: { id: numId } }),
  });

  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  const qc = useQueryClient();
  const listFn = useServerFn(listFavorites);
  const addFn = useServerFn(addFavorite);
  const rmFn = useServerFn(removeFavorite);
  const favs = useQuery({
    queryKey: ["favorites"],
    queryFn: () => listFn(),
    enabled: signedIn,
  });
  const isFav = !!favs.data?.some((f) => f.anime_id === numId);
  const toggleFav = useMutation({
    mutationFn: async () => {
      if (!q.data) return;
      if (isFav) await rmFn({ data: { anime_id: numId } });
      else await addFn({ data: { anime_id: numId, title: q.data.title, image_url: q.data.image ?? null } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

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

      {/* Diagonal banner */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: a.banner ? `url(${a.banner})` : undefined }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-[280px_1fr]">
          <div className="relative">
            <div className="diagonal-clip-tr overflow-hidden rounded-2xl border border-border/60 shadow-[var(--shadow-glow)]">
              {a.image && <img src={a.image} alt={a.title} className="w-full object-cover" />}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <Link to="/" className="mb-4 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="font-display text-4xl font-bold md:text-5xl">{a.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {a.score != null && <span className="text-neon">★ {a.score.toFixed(1)}</span>}
              {a.year && <span>{a.year}</span>}
              {a.type && <span>{a.type}</span>}
              {a.episodes && <span>{a.episodes} eps</span>}
              {a.status && <span>{a.status}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {a.genres.map((g) => (
                <span key={g} className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs">{g}</span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {signedIn ? (
                <button
                  onClick={() => toggleFav.mutate()}
                  disabled={toggleFav.isPending}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    isFav ? "bg-primary text-primary-foreground glow-primary" : "border border-border bg-card hover:bg-secondary"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                  {isFav ? "In your list" : "Add to my list"}
                </button>
              ) : (
                <Link to="/auth" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary">
                  Sign in to save
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 md:grid-cols-[1fr_360px]">
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Synopsis</h2>
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
            {a.synopsis || "No synopsis available."}
          </p>
          {a.trailer && (
            <div className="mt-8">
              <h2 className="mb-3 font-display text-xl font-bold">Trailer</h2>
              <div className="aspect-video overflow-hidden rounded-xl border border-border/60">
                <iframe src={a.trailer} title="Trailer" allowFullScreen className="h-full w-full" />
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/40 p-5">
            <h3 className="mb-4 font-display text-lg font-bold">Where to watch</h3>
            {a.streaming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No official streaming platform reported for your region. Availability may vary — check regional catalogues.
              </p>
            ) : (
              <ul className="space-y-2">
                {a.streaming.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-sm font-medium transition hover:border-primary/60 hover:bg-primary/10"
                    >
                      <span>{s.name}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {a.studios.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <h3 className="mb-2 font-display text-lg font-bold">Studios</h3>
              <p className="text-sm text-muted-foreground">{a.studios.join(", ")}</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
