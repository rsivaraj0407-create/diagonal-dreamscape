import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const links = [
  { to: "/", label: "Discover" },
  { to: "/library", label: "Library" },
  { to: "/trending", label: "Trending" },
] as const;

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-md diagonal-slash animate-glow-pulse" />
          <span className="font-display text-xl font-bold tracking-tight">
            Otaku<span className="text-gradient">Stream</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="transition-colors hover:text-foreground [&.active]:text-foreground">
              {l.label}
            </Link>
          ))}
          {user && (
            <Link to="/favorites" className="transition-colors hover:text-foreground">My List</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground sm:inline">{user.email}</span>
              <button
                onClick={signOut}
                className="rounded-lg border border-border/70 bg-secondary/50 px-3 py-1.5 text-sm font-medium backdrop-blur hover:bg-secondary"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground glow-primary transition-transform hover:scale-[1.03]"
            >
              Sign in
            </Link>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-lg border border-border/70 p-1.5 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border/60 bg-background/90 px-6 py-3 text-sm md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 hover:bg-secondary/60">
              {l.label}
            </Link>
          ))}
          {user && (
            <Link to="/favorites" onClick={() => setOpen(false)} className="rounded-md px-2 py-2 hover:bg-secondary/60">
              My List
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
