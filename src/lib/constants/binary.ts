// Binary Matching Constants
export const BV_MATCH_PAIR = 100;           // 100 BV left + 100 BV right
export const INCOME_PER_MATCH_PAISE = 80000; // ₹800 = 80000 paise per 100:100 match
export const INCOME_PER_MATCH_INR = 800;

// 60% Weaker Side Rule
// The weaker leg must be at least 60% of the stronger leg to qualify for binary income
export const WEAKER_SIDE_MINIMUM_PERCENT = 60;

// 5x Binary Income Cycle
// A member can earn binary income until they've earned 5x their package price
export const BINARY_INCOME_MULTIPLIER = 5;

// Binary matching does NOT include:
// - Personal trading income
// - Sponsor trading income  
// - Leadership pool income
// - Rank achievement bonuses
// Only BINARY MATCHING income counts toward the 5x limit
