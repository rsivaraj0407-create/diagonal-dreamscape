import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("favorites")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { anime_id: number; title: string; image_url?: string | null }) =>
    z
      .object({
        anime_id: z.number().int().positive(),
        title: z.string().min(1).max(300),
        image_url: z.string().url().max(500).nullish(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("favorites").upsert(
      {
        user_id: context.userId,
        anime_id: data.anime_id,
        title: data.title,
        image_url: data.image_url ?? null,
      },
      { onConflict: "user_id,anime_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { anime_id: number }) =>
    z.object({ anime_id: z.number().int().positive() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("favorites")
      .delete()
      .eq("user_id", context.userId)
      .eq("anime_id", data.anime_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
