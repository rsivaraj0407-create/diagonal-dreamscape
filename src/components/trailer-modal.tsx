import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

export function TrailerModal({
  open,
  onClose,
  title,
  embedUrl,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  embedUrl: string | null;
  loading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong relative w-full max-w-4xl overflow-hidden rounded-2xl glow-primary"
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <h3 className="truncate font-display text-sm font-semibold">{title}</h3>
              <button onClick={onClose} aria-label="Close trailer" className="rounded-full p-1.5 hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-background/60">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading trailer…</div>
              ) : embedUrl ? (
                <iframe
                  src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
                  title={title}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  No trailer available for this title.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
