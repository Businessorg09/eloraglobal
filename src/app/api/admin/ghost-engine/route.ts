import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GHOST_USERS = [
  // Global Setup
  { email: 'ghost.david.fx@eloraglobal.com', full_name: 'David Carter', username: 'David_FX', title: 'Prop Trader' },
  { email: 'ghost.mike.p@eloraglobal.com', full_name: 'Mike Peterson', username: 'PropTraderMike', title: 'Funded Trader' },
  { email: 'ghost.sarah.s@eloraglobal.com', full_name: 'Sarah Jenkins', username: 'Sarah_Setups', title: 'Swing Trader' },
  { email: 'ghost.alex.n@eloraglobal.com', full_name: 'Alex Newman', username: 'MacroAlex', title: 'Fundamental Analyst' },
  { email: 'ghost.james.w@eloraglobal.com', full_name: 'James Wilson', username: 'WilsonTrades', title: 'Scalper' },
  { email: 'ghost.emma.l@eloraglobal.com', full_name: 'Emma Larson', username: 'Emma_Crypto', title: 'Crypto Analyst' },
  { email: 'ghost.chris.b@eloraglobal.com', full_name: 'Chris Baker', username: 'Baker_Pips', title: 'Student' },
  { email: 'ghost.ryan.d@eloraglobal.com', full_name: 'Ryan Davis', username: 'Ryan_D', title: 'Day Trader' },
  { email: 'ghost.lucas.m@eloraglobal.com', full_name: 'Lucas Martinez', username: 'LukeTrades', title: 'Student' },
  { email: 'ghost.sophia.t@eloraglobal.com', full_name: 'Sophia Turner', username: 'Sophia_T', title: 'Swing Trader' },
  { email: 'ghost.oliver.h@eloraglobal.com', full_name: 'Oliver Hughes', username: 'OliverH', title: 'Student' },
  { email: 'ghost.jack.r@eloraglobal.com', full_name: 'Jack Robinson', username: 'Jack_FX', title: 'Funded Trader' },
  { email: 'ghost.harry.w@eloraglobal.com', full_name: 'Harry White', username: 'Harry_W', title: 'Student' },
  { email: 'ghost.thomas.s@eloraglobal.com', full_name: 'Thomas Smith', username: 'Tom_Smith', title: 'Day Trader' },
  { email: 'ghost.george.k@eloraglobal.com', full_name: 'George King', username: 'GeorgeK', title: 'Scalper' },
  { email: 'ghost.amelia.c@eloraglobal.com', full_name: 'Amelia Clark', username: 'Amelia_C', title: 'Student' },
  { email: 'ghost.mia.w@eloraglobal.com', full_name: 'Mia Walker', username: 'Mia_Trades', title: 'Student' },
  { email: 'ghost.charlie.h@eloraglobal.com', full_name: 'Charlie Hall', username: 'Charlie_H', title: 'Swing Trader' },
  { email: 'ghost.leo.a@eloraglobal.com', full_name: 'Leo Allen', username: 'Leo_A', title: 'Day Trader' },
  { email: 'ghost.william.m@eloraglobal.com', full_name: 'William Moore', username: 'Will_M', title: 'Student' },
  { email: 'ghost.henry.j@eloraglobal.com', full_name: 'Henry Jackson', username: 'Henry_J', title: 'Funded Trader' },
  { email: 'ghost.ethan.b@eloraglobal.com', full_name: 'Ethan Brown', username: 'Ethan_B', title: 'Day Trader' },
  { email: 'ghost.daniel.j@eloraglobal.com', full_name: 'Daniel Jones', username: 'Dan_J', title: 'Student' },
  { email: 'ghost.matthew.t@eloraglobal.com', full_name: 'Matthew Taylor', username: 'Matt_T', title: 'Scalper' },
  { email: 'ghost.joseph.w@eloraglobal.com', full_name: 'Joseph Williams', username: 'Joe_W', title: 'Student' },
  { email: 'ghost.samuel.d@eloraglobal.com', full_name: 'Samuel Davies', username: 'Sam_D', title: 'Student' },
  { email: 'ghost.david.e@eloraglobal.com', full_name: 'David Evans', username: 'David_E', title: 'Day Trader' },

  // Indian Demographic (20%)
  { email: 'ghost.rahul.k@eloraglobal.com', full_name: 'Rahul Kumar', username: 'Rahul_Options', title: 'Options Trader' },
  { email: 'ghost.amit.s@eloraglobal.com', full_name: 'Amit Sharma', username: 'Amit_Trades', title: 'Student' },
  { email: 'ghost.sneha.p@eloraglobal.com', full_name: 'Sneha Patel', username: 'Sneha_Capital', title: 'Day Trader' },
  { email: 'ghost.priya.s@eloraglobal.com', full_name: 'Priya Singh', username: 'Priya_FX', title: 'Student' },
  { email: 'ghost.vikram.r@eloraglobal.com', full_name: 'Vikram Reddy', username: 'Vikram_R', title: 'Swing Trader' },
  { email: 'ghost.neha.g@eloraglobal.com', full_name: 'Neha Gupta', username: 'Neha_G', title: 'Funded Trader' },
  { email: 'ghost.rohit.v@eloraglobal.com', full_name: 'Rohit Verma', username: 'Rohit_V', title: 'Student' },
  { email: 'ghost.karan.m@eloraglobal.com', full_name: 'Karan Mehta', username: 'Karan_M', title: 'Scalper' }
];

const SCENARIOS = [
  
  {
    topic: 'Technical - TradingView Analysis',
    mainPost: "Just marked up my TradingView for the week. Looking at this massive liquidity grab on US30. If we break this structure, I'm swinging it all week.",
    imageUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80",
    comments: [
      "That divergence on the RSI looks solid too. Good spot.",
      "I'd wait for a 4H close below that wick, otherwise it's just a trap.",
      "What indicators are you using on the bottom pane?"
    ]
  },
  {
topic: 'Psychology - Blown Account',
    mainPost: "Just blew my 50k funded challenge on a stupid Gold news candle. I feel sick. Should I take a week off or dive back in?",
    comments: [
      "Bro, take a walk. Revenge trading will only make you blow another one. We've all been there.",
      "Market was brutal today. Step away from the screens. Gold during NY session was entirely unpredictable.",
      "Take at least 3 days off. Set a rule: no charts. Reset your mind."
    ]
  },
  {
    topic: 'Lifestyle - Travel NYC',
    mainPost: "Heading to New York next week for a quick vacation. Do any of you know good trader lounges or cafes with solid wifi in Manhattan?",
    comments: [
      "Check out the Blank Street cafes, wifi is elite and it's quiet.",
      "NY is great but too distracting for me to trade. I stick to swinging HTF when traveling.",
      "If you're in Soho, try Devocion. But honestly I just trade from my hotel if I have to."
    ]
  },
  {
    topic: 'Indian Market - Nifty',
    mainPost: "Are you guys trading Gold tonight or just sticking to BankNifty options tomorrow morning?",
    comments: [
      "BankNifty has been way too choppy lately. I'm focusing completely on Forex NY sessions now.",
      "Bhai, stick to one. If you are doing options, don't mix it with XAUUSD. Different psychology.",
      "I made decent points on BankNifty today but missed the entire Gold move."
    ],
    indianTarget: true
  },
  {
    topic: 'Technical - EURUSD',
    mainPost: "EUR/USD is tapping a massive daily supply zone. Anyone looking for shorts going into London session?",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80",
    comments: [
      "I have an alert set there too, but waiting for a 15m change of character first.",
      "Careful, DXY is looking weak. It might just blast through that supply.",
      "I'm already in from 1.0850. Let's see how London volume treats it."
    ]
  },
  {
    topic: 'Platform - Elora Academy',
    mainPost: "Just finished week 2 of the Elora Academy modules. The way they explain liquidity concepts finally made it click for me.",
    comments: [
      "Week 3 gets even better, especially the volume profiling stuff.",
      "Same here! I used to trade retail support/resistance and always got stopped out.",
      "Are you guys using the simulator while doing the modules?"
    ]
  },
  {
    topic: 'Psychology - Winning Streak',
    mainPost: "Up 8% this week. I feel invincible but I know this is usually when I make a stupid mistake. How do you guys handle winning streaks?",
    comments: [
      "Lower your risk by half next week. You are emotionally compromised right now even if it feels good.",
      "Withdraw half the profits immediately. Make it real.",
      "Classic euphoria. Take tomorrow off."
    ]
  },
  {
    topic: 'Lifestyle - Setup Upgrade',
    mainPost: "Finally upgraded to a 3-monitor setup. Used to trade on a single 13-inch laptop for 2 years. Feels like a spaceship now.",
    imageUrl: "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?auto=format&fit=crop&q=80",
    comments: [
      "Congrats! Just don't fall into the trap of watching 12 pairs at once now.",
      "Post a pic! I'm still on a laptop and dreaming of a proper desk.",
      "Best investment you can make. Reduces eye strain so much."
    ]
  },
  {
    topic: 'Indian Market - Prop Firm',
    mainPost: "Has anyone from India cleared a major prop firm recently? Which payout method works best right now?",
    comments: [
      "Crypto is easiest right now. Use Binance and P2P it to your bank.",
      "Wire transfers take way too long and the conversion rate is terrible.",
      "I use Deel, works perfectly straight to my HDFC account."
    ],
    indianTarget: true
  }
];

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'SEED_GHOSTS') {
      let created = 0;
      for (const ghost of GHOST_USERS) {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: ghost.email,
          password: 'GhostPassword123!',
          email_confirm: true,
          user_metadata: {
            full_name: ghost.full_name,
          }
        });

        if (authError && !authError.message.includes('already registered')) {
          console.error('Error creating auth user:', authError);
          continue;
        }

        if (authData?.user) {
          // Check if exists in public.users to update or insert
          const { data: existingUser } = await supabaseAdmin.from('users').select('id').eq('email', ghost.email).single();
          
          if (!existingUser) {
            await supabaseAdmin.from('users').insert({
              id: authData.user.id,
              email: ghost.email,
              full_name: ghost.full_name,
              username: ghost.username,
              is_ghost: true,
              custom_title: ghost.title
            });
            created++;
          } else {
            await supabaseAdmin.from('users').update({
              is_ghost: true,
              custom_title: ghost.title,
              username: ghost.username
            }).eq('id', existingUser.id);
          }
        }
      }
      return NextResponse.json({ success: true, message: `Seeded/Updated ghosts.` });
    }

    if (action === 'INJECT_THREAD') {
      // 1. Get all ghosts
      const { data: ghosts } = await supabaseAdmin.from('users').select('id').eq('is_ghost', true);
      if (!ghosts || ghosts.length === 0) return NextResponse.json({ error: 'No ghosts found. Seed first.' }, { status: 400 });

      // 2. Pick a scenario
      const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

      // 3. Shuffle ghosts to pick a random author and commenters
      const shuffledGhosts = ghosts.sort(() => 0.5 - Math.random());
      const authorId = shuffledGhosts[0].id;
      
      // 4. Create Main Post (pretend it happened 10-30 mins ago)
      const postMinutesAgo = Math.floor(Math.random() * 20) + 10;
      const postDate = new Date(Date.now() - postMinutesAgo * 60000).toISOString();

      const { data: newPost, error: postError } = await supabaseAdmin.from('community_posts').insert({
        author_id: authorId,
        content: scenario.mainPost,
        category: 'General',
        image_url: scenario.imageUrl || null,
        is_mock: true,
        created_at: postDate,
        updated_at: postDate
      }).select().single();

      if (postError) throw postError;

      // 5. Create Comments (if community_comments exists)
      // Check if community_comments table exists
      const { error: checkTableError } = await supabaseAdmin.from('community_comments').select('id').limit(1);
      
      if (!checkTableError || checkTableError.code !== '42P01') {
        // Table exists, inject comments
        let commentTime = postMinutesAgo - 2; // first comment 2 mins after post
        
        for (let i = 0; i < scenario.comments.length; i++) {
          if (commentTime < 1) commentTime = 1; // don't go into the future
          
          const commenterId = shuffledGhosts[(i % (shuffledGhosts.length - 1)) + 1].id;
          const commentDate = new Date(Date.now() - commentTime * 60000).toISOString();
          
          await supabaseAdmin.from('community_comments').insert({
            post_id: newPost.id,
            author_id: commenterId,
            content: scenario.comments[i],
            is_mock: true,
            created_at: commentDate,
            updated_at: commentDate
          });
          
          commentTime -= Math.floor(Math.random() * 4) + 1; // subtract 1-4 minutes for next comment
        }
      }

      return NextResponse.json({ success: true, scenario: scenario.topic });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Ghost Engine Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
