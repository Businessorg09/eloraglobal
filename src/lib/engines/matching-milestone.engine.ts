/**
 * Milestone Bonus Engine
 * Calculates whether a user has hit specific binary matching milestones (1st, 5th, 10th pair)
 * within the required timeframe since they joined, and returns the exact INR bonus amount.
 */

export interface MilestoneCriteria {
  requiredMatches: number;
  timeLimitDays: number;
  amountPaise: number;
}

// 1st match within 7 days = ₹200
// 5th match within 20 days = ₹1,000
// 10th match within 30 days = ₹12,000
// 20th match within 45 days = ₹25,000
// 50th match within 60 days = ₹60,000
// 100th match within 80 days = ₹100,000
export const MILESTONES: MilestoneCriteria[] = [
  { requiredMatches: 1, timeLimitDays: 7, amountPaise: 200 * 100 },
  { requiredMatches: 5, timeLimitDays: 20, amountPaise: 1000 * 100 },
  { requiredMatches: 10, timeLimitDays: 30, amountPaise: 12000 * 100 },
  { requiredMatches: 20, timeLimitDays: 45, amountPaise: 25000 * 100 },
  { requiredMatches: 50, timeLimitDays: 60, amountPaise: 60000 * 100 },
  { requiredMatches: 100, timeLimitDays: 80, amountPaise: 100000 * 100 },
];

export function calculateMilestoneBonuses(
  previousLifetimePairs: number,
  newLifetimePairs: number,
  userCreatedAt: string
): { milestone: number; amountPaise: number; daysElapsed: number }[] {
  const bonusesToAward = [];
  
  // Calculate days elapsed since user joined
  const joinDate = new Date(userCreatedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Iterate over our defined milestones
  for (const milestone of MILESTONES) {
    // If the user crossed the threshold this cycle...
    if (previousLifetimePairs < milestone.requiredMatches && newLifetimePairs >= milestone.requiredMatches) {
      
      // ...AND they did it within the time limit
      if (daysElapsed <= milestone.timeLimitDays) {
        bonusesToAward.push({
          milestone: milestone.requiredMatches,
          amountPaise: milestone.amountPaise,
          daysElapsed
        });
      }
    }
  }

  return bonusesToAward;
}
