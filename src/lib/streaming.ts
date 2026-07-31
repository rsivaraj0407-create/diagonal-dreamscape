export type Tier = "free" | "premium" | "mixed";

const TIERS: { match: RegExp; tier: Tier }[] = [
  { match: /crunchyroll/i, tier: "mixed" },
  { match: /netflix/i, tier: "premium" },
  { match: /disney/i, tier: "premium" },
  { match: /hulu/i, tier: "premium" },
  { match: /prime|amazon/i, tier: "premium" },
  { match: /hidive/i, tier: "premium" },
  { match: /max|hbo/i, tier: "premium" },
  { match: /tubi|pluto|freevee|youtube|retrocrush|midnight pulp/i, tier: "free" },
  { match: /muse|ani-one|bilibili|iqiyi/i, tier: "mixed" },
];

export function tierFor(name: string): Tier {
  return TIERS.find((t) => t.match.test(name))?.tier ?? "mixed";
}

export const tierLabel: Record<Tier, string> = {
  free: "Free with ads",
  premium: "Subscription",
  mixed: "Free + Premium",
};

export const tierClass: Record<Tier, string> = {
  free: "border-cyan/40 bg-cyan/10 text-cyan",
  premium: "border-primary/40 bg-primary/15 text-foreground",
  mixed: "border-violet/40 bg-violet/15 text-foreground",
};
