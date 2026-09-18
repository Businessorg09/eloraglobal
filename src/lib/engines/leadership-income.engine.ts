import { MAX_LEADERSHIP_LEVELS, TOTAL_LEADERSHIP_POOL_PERCENT } from '../constants/sponsor-levels';

export interface UplineMember {
  userId: string;
  level: number;         // 1-20 (1 = nearest upline)
  isActive: boolean;
  hasActivePackage: boolean;
}

export interface LeadershipIncomeInput {
  traderUserId: string;
  leadershipPoolPaise: number;    // 5% of trading payout
  binaryUplineChain: UplineMember[];  // up to 20 uplines from binary tree
  exchangeRate: number;
  payoutAmountUsdCents: number;
}

export interface LeadershipIncomeDistribution {
  userId: string;
  level: number;
  amountPaise: number;
}

export interface LeadershipIncomeResult {
  distributions: LeadershipIncomeDistribution[];
  companyRetainedPaise: number;
  totalDistributedPaise: number;
  perLevelAmountPaise: number;    // pool / 20
}

/**
 * Calculates leadership pool distribution across 20 binary upline levels.
 */
export function calculateLeadershipIncome(input: LeadershipIncomeInput): LeadershipIncomeResult {
  const perLevelAmountPaise = Math.floor(input.leadershipPoolPaise / MAX_LEADERSHIP_LEVELS);
  
  const distributions: LeadershipIncomeDistribution[] = [];
  let totalDistributedPaise = 0;

  for (const member of input.binaryUplineChain) {
    if (!member.isActive || !member.hasActivePackage) {
      continue;
    }

    distributions.push({
      userId: member.userId,
      level: member.level,
      amountPaise: perLevelAmountPaise,
    });
    
    totalDistributedPaise += perLevelAmountPaise;
  }

  const companyRetainedPaise = input.leadershipPoolPaise - totalDistributedPaise;

  return {
    distributions,
    companyRetainedPaise,
    totalDistributedPaise,
    perLevelAmountPaise,
  };
}
