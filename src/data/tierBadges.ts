export const TIER_BADGE_IMAGES = {
  1: require("../../assets/icons/tiers/tier-1.png"),
  2: require("../../assets/icons/tiers/tier-2.png"),
  3: require("../../assets/icons/tiers/tier-3.png"),
  4: require("../../assets/icons/tiers/tier-4.png"),
  5: require("../../assets/icons/tiers/tier-5.png"),
  6: require("../../assets/icons/tiers/tier-6.png"),
} as const;

export function getTierBadgeImage(tier: number) {
  const safeTier = Math.max(1, Math.min(6, Math.round(tier))) as keyof typeof TIER_BADGE_IMAGES;
  return TIER_BADGE_IMAGES[safeTier];
}
