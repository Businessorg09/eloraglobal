import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const SPONSOR_LEVELS = [0.05, 0.03, 0.02, 0.015, 0.01, 0.005, 0.005, 0.005, 0.005, 0.005];
const LEADERSHIP_LEVELS = Array(20).fill(0.0025); // 0.25% x 20 = 5%

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          }
        },
      }
    );

    // Initialize admin client to bypass RLS for complex wallet updates
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll(cookiesToSet) {}
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { account_id, gross_profit_usd } = body;

    if (!account_id || !gross_profit_usd || gross_profit_usd <= 0) {
      return NextResponse.json({ error: 'Invalid payout amount' }, { status: 400 });
    }

    // 1. Verify Trading Account
    let account = null;
    let isTestMode = account_id === 'test-account-id';

    if (isTestMode) {
      // Simulate a test account
      account = { id: 'test-account-id', account_number: 'TEST-999', balance: '10000.00', equity: '10000.00' };
    } else {
      const { data: dbAccount, error: accError } = await supabaseAdmin
        .from('trading_accounts')
        .select('*')
        .eq('id', account_id)
        .eq('user_id', user.id)
        .single();

      if (accError || !dbAccount) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
      account = dbAccount;
    }

    if (gross_profit_usd > parseFloat(account.balance)) {
       return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Fetch dynamic exchange rate from platform settings
    const { data: settingsData } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'EXCHANGE_RATE_USD_INR')
      .single();

    const USD_TO_INR = settingsData && settingsData.value ? parseFloat(settingsData.value) : 85.0;

    // --- Dual Currency Distribution Math ---
    const grossCents = Math.floor(gross_profit_usd * 100);
    const traderShareCents = Math.floor(grossCents * 0.70);
    const companyShareCents = Math.floor(grossCents * 0.10);
    const networkAllocationCents = grossCents - traderShareCents - companyShareCents; // ~20%
    
    const networkAllocationUsd = networkAllocationCents / 100;
    const networkAllocationInr = networkAllocationUsd * USD_TO_INR;
    const networkAllocationPaise = Math.floor(networkAllocationInr * 100);

    // 2. Deduct from Trading Account (skip if test mode)
    if (!isTestMode) {
      const newBalance = parseFloat(account.balance) - gross_profit_usd;
      const newEquity = parseFloat(account.equity) - gross_profit_usd;
      
      await supabaseAdmin
        .from('trading_accounts')
        .update({ balance: newBalance, equity: newEquity })
        .eq('id', account.id);
    }

    // Create unique payout request ID early to use as reference
    const payoutRequestId = crypto.randomUUID();

    const adminId = '0dd1d684-d50a-4fbb-943b-bb4af05cdfe2'; // fundingforu.in@gmail.com
    // 3. Create Transactions and Update Wallets
    if (traderShareCents > 0) {
      // 3a. Update Trader's Wallet (70%)
      const { data: traderWallet } = await supabaseAdmin.from('wallets').select('*').eq('user_id', user.id).single();
      
      if (traderWallet) {
        await supabaseAdmin.from('wallets').update({
          trading_income_cents: parseInt(traderWallet.trading_income_cents || '0') + traderShareCents
        }).eq('user_id', user.id);

        await supabaseAdmin.from('transactions').insert({
          user_id: user.id,
          transaction_type: 'TRADING_INCOME',
          amount_paise: 0,
          amount_cents: traderShareCents,
          currency: 'USD',
          description: `Prop Firm Payout (70% Share) - Account ${account.account_number}`,
          reference_id: payoutRequestId
        });
      }
      
      // 3b. Update Company's Wallet (10%)
      const { data: adminWallet } = await supabaseAdmin.from('wallets').select('*').eq('user_id', adminId).single();
      
      if (adminWallet) {
        await supabaseAdmin.from('wallets').update({
          company_retained_cents: parseInt(adminWallet.company_retained_cents || '0') + companyShareCents
        }).eq('user_id', adminId);

        await supabaseAdmin.from('transactions').insert({
          user_id: adminId,
          transaction_type: 'TRADING_INCOME', // History API relies on description to identify company retained
          amount_paise: 0,
          amount_cents: companyShareCents,
          currency: 'USD',
          description: `Company Retained (10% Share) - Account ${account.account_number}`,
          reference_id: payoutRequestId
        });
      }
    }

    // 4. Record to Payout Exchange Ledger
    await supabaseAdmin.from('payout_exchange_ledger').insert({
      payout_request_id: payoutRequestId,
      trader_user_id: user.id,
      gross_usd: gross_profit_usd,
      trader_share_usd: traderShareCents / 100,
      company_share_usd: companyShareCents / 100,
      network_allocation_usd: networkAllocationUsd,
      exchange_rate: USD_TO_INR,
      network_allocation_inr: networkAllocationInr
    });

    // 4. Distribute to Sponsor Upline (Unilevel) - 15% across 10 levels
    let currentUserId = user.id;
    let hasUplineSponsor = true;

    for (let level = 0; level < 10; level++) {
      let sponsorId = null;
      let isBreakage = false;

      if (hasUplineSponsor) {
        const { data: currentUser } = await supabaseAdmin.from('users').select('referred_by').eq('id', currentUserId).single();
        if (!currentUser || !currentUser.referred_by) {
          hasUplineSponsor = false;
          isBreakage = true;
          sponsorId = adminId;
        } else {
          sponsorId = currentUser.referred_by;
          currentUserId = sponsorId;
        }
      } else {
        isBreakage = true;
        sponsorId = adminId;
      }
      
      const poolFraction = SPONSOR_LEVELS[level] / 0.20;
      const sponsorPaise = Math.floor(networkAllocationPaise * poolFraction);

      if (sponsorPaise > 0 && sponsorId) {
        const { data: sponsorWallet } = await supabaseAdmin.from('wallets').select('*').eq('user_id', sponsorId).single();
        if (sponsorWallet) {
          await supabaseAdmin.from('wallets').update({
            // If it's breakage, we add it to company_retained instead of sponsor income
            [isBreakage ? 'company_retained_cents' : 'sponsor_income_paise']: 
              parseInt(sponsorWallet[isBreakage ? 'company_retained_cents' : 'sponsor_income_paise'] || '0') + (isBreakage ? Math.floor(sponsorPaise / USD_TO_INR) : sponsorPaise)
          }).eq('user_id', sponsorId);
        }

        await supabaseAdmin.from('transactions').insert({
          user_id: sponsorId,
          transaction_type: 'SPONSOR_INCOME',
          amount_paise: isBreakage ? 0 : sponsorPaise,
          amount_cents: isBreakage ? Math.floor(sponsorPaise / USD_TO_INR) : 0,
          currency: isBreakage ? 'USD' : 'INR',
          description: isBreakage 
            ? `Level ${level + 1} Sponsor Breakage (No User) from ${user.id}`
            : `Level ${level + 1} Sponsor Trading Bonus from ${user.id}`,
          reference_id: payoutRequestId
        });
      }
    }

    // 5. Distribute to Leadership Upline (Binary Tree) - 5% across 20 levels
    let currentBinaryNode = user.id;
    let hasUplineBinary = true;
    let levelsUp = 1;
    const MAX_BINARY_LEVELS = 20;

    while (levelsUp <= MAX_BINARY_LEVELS) {
      let leaderId = null;
      let isBreakage = false;

      if (hasUplineBinary) {
        const { data: treeNode } = await supabaseAdmin.from('binary_tree').select('parent_id').eq('user_id', currentBinaryNode).single();
        if (!treeNode || !treeNode.parent_id) {
          hasUplineBinary = false;
          isBreakage = true;
          leaderId = adminId;
        } else {
          leaderId = treeNode.parent_id;
          currentBinaryNode = leaderId;
        }
      } else {
        isBreakage = true;
        leaderId = adminId;
      }
      
      const leaderFraction = LEADERSHIP_LEVELS[levelsUp - 1] / 0.20;
      const leaderPaise = Math.floor(networkAllocationPaise * leaderFraction);

      if (leaderPaise > 0 && leaderId) {
        const { data: leaderWallet } = await supabaseAdmin.from('wallets').select('*').eq('user_id', leaderId).single();
        if (leaderWallet) {
          await supabaseAdmin.from('wallets').update({
            [isBreakage ? 'company_retained_cents' : 'leadership_income_paise']: 
              parseInt(leaderWallet[isBreakage ? 'company_retained_cents' : 'leadership_income_paise'] || '0') + (isBreakage ? Math.floor(leaderPaise / USD_TO_INR) : leaderPaise)
          }).eq('user_id', leaderId);
        }

        await supabaseAdmin.from('transactions').insert({
          user_id: leaderId,
          transaction_type: 'LEADERSHIP_INCOME',
          amount_paise: isBreakage ? 0 : leaderPaise,
          amount_cents: isBreakage ? Math.floor(leaderPaise / USD_TO_INR) : 0,
          currency: isBreakage ? 'USD' : 'INR',
          description: isBreakage 
            ? `Level ${levelsUp} Leadership Breakage (No User) from ${user.id}`
            : `Level ${levelsUp} Leadership Trading Bonus from ${user.id}`,
          reference_id: payoutRequestId
        });
      }
      
      levelsUp++;
    }

    return NextResponse.json({ success: true, message: 'Payout distributed successfully.' });

  } catch (error: any) {
    console.error('Payout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
