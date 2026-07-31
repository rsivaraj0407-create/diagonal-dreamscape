import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addFavorite, listFavorites, removeFavorite } from "@/lib/favorites.functions";

export function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);
  return signedIn;
}

export function useWatchlist() {
  const signedIn = useSignedIn();
  const qc = useQueryClient();
  const listFn = useServerFn(listFavorites);
  const addFn = useServerFn(addFavorite);
  const rmFn = useServerFn(removeFavorite);

  const favorites = useQuery({
    queryKey: ["favorites"],
    queryFn: () => listFn(),
    enabled: signedIn,
  });

  const ids = new Set((favorites.data ?? []).map((f) => f.anime_id));

  const toggle = useMutation({
    mutationFn: async (item: { id: number; title: string; image?: string | null }) => {
      if (ids.has(item.id)) await rmFn({ data: { anime_id: item.id } });
      else await addFn({ data: { anime_id: item.id, title: item.title, image_url: item.image ?? null } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return { signedIn, favorites, ids, toggle, isSaved: (id: number) => ids.has(id) };
}
