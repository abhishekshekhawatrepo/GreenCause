/** Application-wide constants */

export const APP_NAME = 'GreenCause';
export const APP_TAGLINE = 'Track · Win · Give';
export const APP_DESCRIPTION =
  'Elevate your game, win monthly rewards, and support impactful charities. GreenCause combines golf performance tracking with purposeful giving.';

/* Pricing (INR) */
export const PLAN_MONTHLY_PRICE = 499;
export const PLAN_YEARLY_PRICE = 4999;
export const CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

/* Charity contribution tiers */
export const CHARITY_TIERS = [10, 15, 20, 25] as const;
export const DEFAULT_CHARITY_TIER = 10;

/* Score constraints */
export const SCORE_MIN = 1;
export const SCORE_MAX = 45;
export const ROLLING_WINDOW_SIZE = 5;

/* Draw config */
export const DRAW_NUMBERS_COUNT = 5;
export const PRIZE_SPLIT = {
  FIVE_MATCH: 0.40,   // 40% of pool → jackpot
  FOUR_MATCH: 0.35,   // 35% of pool → split
  THREE_MATCH: 0.25,  // 25% of pool → split
} as const;

/* Winner proof upload */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/* Navigation links */
export const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/charities', label: 'Charities' },
  { href: '/pricing', label: 'Pricing' },
] as const;
