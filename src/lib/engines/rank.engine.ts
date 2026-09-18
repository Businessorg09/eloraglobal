import { RANKS, RANK_ORDER, RankKey } from '../constants/ranks';

export interface RankEvaluationInput {
  userId: string;
  leftLifetimeRankBv: number;
  rightLifetimeRankBv: number;
  activeDirectCount: number;
  currentRank: RankKey;
  bonusesClaimed: Record<RankKey, boolean>; // which rank bonuses already claimed
}

export interface RankEvaluationResult {
  userId: string;
  qualificationBv: number;          // MIN(left, right)
  highestQualifiedRank: RankKey;
  isPromotion: boolean;             // did rank change?
  previousRank: RankKey;
  newRank: RankKey;
  newWeeklyCapPaise: number;
  bonusesToAward: Array<{
    rank: RankKey;
    amountPaise: number;
  }>;                               // could be multiple if they skip ranks
}

/**
 * Rank evaluation engine.
 * Determines a user's new rank based on their lifetime BV and active directs.
 * Returns appropriate bonuses including ones for skipped ranks.
 */
export function evaluateRank(input: RankEvaluationInput): RankEvaluationResult {
  const qualificationBv = Math.min(input.leftLifetimeRankBv, input.rightLifetimeRankBv);
  
  let highestQualifiedRank: RankKey = 'STARTER';
  
  // Find highest qualified rank
  for (const rankKey of RANK_ORDER) {
    const rankDef = RANKS[rankKey];
    if (qualificationBv >= rankDef.requiredBv && input.activeDirectCount >= rankDef.requiredDirects) {
      highestQualifiedRank = rankKey;
    }
  }

  const currentRankOrder = RANKS[input.currentRank].order;
  const newRankOrder = RANKS[highestQualifiedRank].order;
  
  const isPromotion = newRankOrder > currentRankOrder;
  const newRank = isPromotion ? highestQualifiedRank : input.currentRank;

  const bonusesToAward: Array<{ rank: RankKey; amountPaise: number }> = [];

  // Check all ranks up to the highest qualified rank for unclaimed bonuses
  if (isPromotion) {
    for (let i = currentRankOrder + 1; i <= newRankOrder; i++) {
      const iterRankKey = RANK_ORDER[i];
      const iterRankDef = RANKS[iterRankKey];
      
      if (!input.bonusesClaimed[iterRankKey] && iterRankDef.achievementBonusPaise > 0) {
        bonusesToAward.push({
          rank: iterRankKey,
          amountPaise: iterRankDef.achievementBonusPaise,
        });
      }
    }
  }

  return {
    userId: input.userId,
    qualificationBv,
    highestQualifiedRank,
    isPromotion,
    previousRank: input.currentRank,
    newRank,
    newWeeklyCapPaise: RANKS[newRank].weeklyBinaryCapPaise,
    bonusesToAward,
  };
}
