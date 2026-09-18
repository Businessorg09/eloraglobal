export const PACKAGES = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    priceInr: 4825,        // ₹4,825
    pricePaise: 482500,
    businessVolume: 100,
    binaryIncomeLimit: 24125,    // 5x = ₹24,125
    binaryIncomeLimitPaise: 2412500,
    fundedAccountSize: 10000,    // $10,000
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    priceInr: 16899,
    pricePaise: 1689900,
    businessVolume: 450,
    binaryIncomeLimit: 84495,
    binaryIncomeLimitPaise: 8449500,
    fundedAccountSize: 25000,
  },
  ELITE: {
    id: 'elite',
    name: 'Elite',
    priceInr: 53200,
    pricePaise: 5320000,
    businessVolume: 1800,
    binaryIncomeLimit: 266000,
    binaryIncomeLimitPaise: 26600000,
    fundedAccountSize: 100000,
  },
} as const;

export type PackageSlug = keyof typeof PACKAGES;
