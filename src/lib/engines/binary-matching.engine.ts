import { BV_MATCH_PAIR, INCOME_PER_MATCH_PAISE } from '../constants/binary';

export interface BinaryMatchInput {
  nodeId: string;
  leftBv: number;          // current period left BV
  rightBv: number;         // current period right BV
  leftBvCarryover: number; // carried from last period
  rightBvCarryover: number;
  totalBinaryIncomeEarnedPaise: number;  // lifetime binary income so far
  binaryIncomeLimitPaise: number;        // 5x package limit
  weeklyBinaryCapPaise: number;          // rank-based weekly cap
  isBinaryEarningActive: boolean;        // false if 5x limit reached
  lifetimeMatchedPairs: number;          // total pairs matched so far
}

export interface BinaryMatchResult {
  nodeId: string;
  qualified: boolean;           // did they pass the 60% rule?
  disqualifyReason?: string;
  
  // Input totals
  totalLeftBv: number;          // leftBv + leftBvCarryover
  totalRightBv: number;
  weakerSide: number;
  strongerSide: number;
  weakerSidePercent: number;    // weaker/stronger * 100
  
  // Matching calculations
  matchableBv: number;          // min(totalLeft, totalRight)
  matchedPairs: number;         // floor(matchableBv / 100)
  rawIncomePaise: number;       // pairs * 80000
  
  // Cap applications
  afterWeeklyCapPaise: number;  // min(raw, weeklyCapPaise)
  afterCycleLimitPaise: number; // min(afterWeeklyCap, remaining5x)
  finalIncomePaise: number;     // the actual payout
  
  // BV updates
  bvConsumed: number;           // how much BV was actually used
  newLeftBvCarryover: number;   // carry forward
  newRightBvCarryover: number;
  
  // Status updates
  newTotalBinaryIncomeEarnedPaise: number;
  isCycleComplete: boolean;     // did they hit 5x this period?
  newLifetimeMatchedPairs: number;
}

/**
 * Core binary matching algorithm.
 * Calculates binary income, handles 60% weaker side rule, weekly caps, and 5x cycle limits.
 */
export function calculateBinaryMatch(input: BinaryMatchInput): BinaryMatchResult {
  const totalLeftBv = input.leftBv + input.leftBvCarryover;
  const totalRightBv = input.rightBv + input.rightBvCarryover;
  
  const weakerSide = Math.min(totalLeftBv, totalRightBv);
  const strongerSide = Math.max(totalLeftBv, totalRightBv);
  
  const weakerSidePercent = strongerSide > 0 ? (weakerSide / strongerSide) * 100 : 0;
  
  const result: BinaryMatchResult = {
    nodeId: input.nodeId,
    qualified: false,
    
    totalLeftBv,
    totalRightBv,
    weakerSide,
    strongerSide,
    weakerSidePercent,
    
    matchableBv: 0,
    matchedPairs: 0,
    rawIncomePaise: 0,
    
    afterWeeklyCapPaise: 0,
    afterCycleLimitPaise: 0,
    finalIncomePaise: 0,
    
    bvConsumed: 0,
    // Initialize carryovers: carry everything forward initially (for disqualified nodes)
    newLeftBvCarryover: totalLeftBv,
    newRightBvCarryover: totalRightBv,
    
    newTotalBinaryIncomeEarnedPaise: input.totalBinaryIncomeEarnedPaise,
    isCycleComplete: !input.isBinaryEarningActive,
    newLifetimeMatchedPairs: input.lifetimeMatchedPairs,
  };

  if (!input.isBinaryEarningActive) {
    result.disqualifyReason = 'Binary earning limit (5x) already reached.';
    return result;
  }

  if (totalLeftBv === 0 && totalRightBv === 0) {
    result.disqualifyReason = 'No BV to match.';
    return result;
  }

  if (weakerSide === 0) {
    result.disqualifyReason = 'Weaker side has zero BV.';
    return result;
  }

  // No weaker-side percentage rule — any BV on both sides can match.
  // If one side has BV and the other doesn't, we just skip (handled above).

  result.qualified = true;

  // Calculate pairs based on matchable BV (must be increments of BV_MATCH_PAIR)
  result.matchableBv = weakerSide;
  result.matchedPairs = Math.floor(result.matchableBv / BV_MATCH_PAIR);
  result.rawIncomePaise = result.matchedPairs * INCOME_PER_MATCH_PAISE;

  if (result.rawIncomePaise === 0) {
    result.disqualifyReason = `Not enough BV for a pair. Requires at least ${BV_MATCH_PAIR}.`;
    return result;
  }

  // Apply Caps
  result.afterWeeklyCapPaise = Math.min(result.rawIncomePaise, input.weeklyBinaryCapPaise);
  
  const remainingCycleLimitPaise = Math.max(0, input.binaryIncomeLimitPaise - input.totalBinaryIncomeEarnedPaise);
  result.afterCycleLimitPaise = Math.min(result.afterWeeklyCapPaise, remainingCycleLimitPaise);
  
  result.finalIncomePaise = result.afterCycleLimitPaise;

  // ─── BV Carryover Rule ────────────────────────────────────────────────────
  // BV consumed = matchedPairs × 100 (whole pairs actually matched)
  // This is consumed from BOTH sides equally.
  // The surplus of the stronger side carries forward to next week.
  //
  // Example: Left=1100 BV, Right=3000 BV
  //   matchedPairs = floor(1100/100) = 11
  //   bvConsumed   = 11 × 100 = 1100 BV
  //   Left carryover  = 1100 - 1100 = 0
  //   Right carryover = 3000 - 1100 = 1900 BV (carries to next week)
  //
  // Note: If income is capped by weekly/5x limit, the payout is reduced
  // but the BV is STILL fully consumed — the user already got their match.
  result.bvConsumed = result.matchedPairs * BV_MATCH_PAIR;
  result.newLeftBvCarryover = Math.max(0, totalLeftBv - result.bvConsumed);
  result.newRightBvCarryover = Math.max(0, totalRightBv - result.bvConsumed);

  result.newTotalBinaryIncomeEarnedPaise = input.totalBinaryIncomeEarnedPaise + result.finalIncomePaise;
  result.isCycleComplete = result.newTotalBinaryIncomeEarnedPaise >= input.binaryIncomeLimitPaise;
  result.newLifetimeMatchedPairs = input.lifetimeMatchedPairs + result.matchedPairs;

  return result;
}
