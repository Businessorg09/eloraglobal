import { SPONSOR_LEVEL_PERCENTAGES, TOTAL_SPONSOR_POOL_PERCENT } from '../constants/sponsor-levels';

export interface SponsorChainMember {
  userId: string;
  level: number;         // 1-10
  isActive: boolean;
  hasActivePackage: boolean;
}

export interface SponsorIncomeInput {
  traderUserId: string;
  sponsorPoolPaise: number;     // 15% of trading payout in paise
  sponsorChain: SponsorChainMember[];  // up to 10 sponsors
  exchangeRate: number;
  payoutAmountUsdCents: number;
}

export interface SponsorIncomeDistribution {
  userId: string;
  level: number;
  percentageOfPayout: number;
  amountPaise: number;
}

export interface SponsorIncomeResult {
  distributions: SponsorIncomeDistribution[];
  companyRetainedPaise: number;   // undistributed (inactive/missing levels)
  totalDistributedPaise: number;
}

/**
 * Calculates sponsor income distribution across 10 levels.
 */
export function calculateSponsorIncome(input: SponsorIncomeInput): SponsorIncomeResult {
  const distributions: SponsorIncomeDistribution[] = [];
  let totalDistributedPaise = 0;

  for (const member of input.sponsorChain) {
    if (!member.isActive || !member.hasActivePackage) {
      continue;
    }

    const percentage = SPONSOR_LEVEL_PERCENTAGES[member.level];
    if (!percentage) continue;

    // Calculate amount using proportion of the pool
    const amountPaise = Math.floor((input.sponsorPoolPaise * percentage) / TOTAL_SPONSOR_POOL_PERCENT);
    
    distributions.push({
      userId: member.userId,
      level: member.level,
      percentageOfPayout: percentage,
      amountPaise,
    });
    
    totalDistributedPaise += amountPaise;
  }

  const companyRetainedPaise = input.sponsorPoolPaise - totalDistributedPaise;

  return {
    distributions,
    companyRetainedPaise,
    totalDistributedPaise,
  };
}
