// 10-Level Sponsor Trading Income Split
// Total: 15% of trader's payout
// These are the share percentages OF the pool (must sum to 100)
// Declining model: L1 gets the largest share, L10 gets the smallest
export const SPONSOR_LEVEL_PERCENTAGES: Record<number, number> = {
  1: 30, // 30% of pool = 4.5% of total payout
  2: 20, // 20% of pool = 3.0% of total payout
  3: 13, // 13% of pool = 1.95% of total payout
  4: 10, // 10% of pool = 1.5% of total payout
  5: 8,  //  8% of pool = 1.2% of total payout
  6: 6,  //  6% of pool = 0.9% of total payout
  7: 5,  //  5% of pool = 0.75% of total payout
  8: 4,  //  4% of pool = 0.6% of total payout
  9: 3,  //  3% of pool = 0.45% of total payout
  10: 1, //  1% of pool = 0.15% of total payout
};
// Total = 100% of the 15% pool

export const TOTAL_SPONSOR_POOL_PERCENT = 15;
export const MAX_SPONSOR_LEVELS = 10;

// 20-Level Leadership Pool Income Split
// Total: 5% of trader's payout, split equally
export const TOTAL_LEADERSHIP_POOL_PERCENT = 5;
export const MAX_LEADERSHIP_LEVELS = 20;
export const PER_LEVEL_LEADERSHIP_PERCENT = TOTAL_LEADERSHIP_POOL_PERCENT / MAX_LEADERSHIP_LEVELS; // 0.25%

// Trading Payout Distribution
export const TRADING_PAYOUT_SPLIT = {
  TRADER: 70,
  SPONSOR_POOL: 15,
  LEADERSHIP_POOL: 5,
  COMPANY: 10,
} as const;
