import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-md diagonal-slash" />
          <span className="font-display text-xl font-bold tracking-tight">
            Otaku<span className="text-gradient">Stream</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/" className="transition-colors hover:text-foreground">Discover</Link>
          {user && (
            <Link to="/favorites" className="transition-colors hover:text-foreground">My List</Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
              <button
                onClick={signOut}
                className="rounded-md border border-border/70 bg-secondary/60 px-3 py-1.5 text-sm font-medium hover:bg-secondary"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground glow-primary transition-transform hover:scale-[1.02]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
