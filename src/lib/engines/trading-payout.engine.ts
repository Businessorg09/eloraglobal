import { TRADING_PAYOUT_SPLIT } from '../constants/sponsor-levels';
import { convertUsdToInrPaise, percentageOf } from '../utils/money';

export interface TradingPayoutInput {
  traderUserId: string;
  payoutAmountUsdCents: number;     // profit in USD cents
  exchangeRateUsdToInr: number;     // e.g., 83.50
}

export interface TradingPayoutResult {
  traderUserId: string;
  payoutAmountUsdCents: number;
  exchangeRate: number;
  totalPayoutInrPaise: number;      // converted to INR paise
  
  traderSharePaise: number;         // 70%
  sponsorPoolPaise: number;         // 15%
  leadershipPoolPaise: number;      // 5%
  companySharePaise: number;        // 10%
}

/**
 * Trading payout distribution engine.
 * Calculates splits for Trader, Sponsor, Leadership, and Company.
 */
export function calculateTradingPayoutSplit(input: TradingPayoutInput): TradingPayoutResult {
  const totalPayoutInrPaise = convertUsdToInrPaise(input.payoutAmountUsdCents, input.exchangeRateUsdToInr);
  
  const traderSharePaise = percentageOf(totalPayoutInrPaise, TRADING_PAYOUT_SPLIT.TRADER);
  const sponsorPoolPaise = percentageOf(totalPayoutInrPaise, TRADING_PAYOUT_SPLIT.SPONSOR_POOL);
  const leadershipPoolPaise = percentageOf(totalPayoutInrPaise, TRADING_PAYOUT_SPLIT.LEADERSHIP_POOL);
  const companySharePaise = percentageOf(totalPayoutInrPaise, TRADING_PAYOUT_SPLIT.COMPANY);

  return {
    traderUserId: input.traderUserId,
    payoutAmountUsdCents: input.payoutAmountUsdCents,
    exchangeRate: input.exchangeRateUsdToInr,
    totalPayoutInrPaise,
    traderSharePaise,
    sponsorPoolPaise,
    leadershipPoolPaise,
    companySharePaise,
  };
}
