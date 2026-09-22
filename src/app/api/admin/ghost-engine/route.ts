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
    topic: 'Technical - SMC/ICT on XAUUSD',
    mainPost: "XAUUSD sweeping Asian highs right now. Found a pristine 15m FVG (Fair Value Gap) overlapping with a bearish order block. Taking shorts if we get a 1m CHoCH (Change of Character) here. Stop loss strictly above the wick.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80",
    comments: [
      "Careful, DXY is looking weak and might push gold higher into the 4H premium zone.",
      "I took the exact same entry! The liquidity void below is massive. Target is yesterday's low.",
      "What's your invalidation level? Above the OB?"
    ]
  },
  {
    topic: 'Technical - Wyckoff on BTC',
    mainPost: "BTC printing a textbook Wyckoff Accumulation phase on the 4H. We just had the Spring and are testing the supply line now. Macro structure looks incredibly bullish if we clear this liquidity.",
    imageUrl: "https://images.unsplash.com/photo-1621252179027-9ec45b0a3598?auto=format&fit=crop&q=80",
    comments: [
      "Volume signature on the Spring was perfect. Huge effort, no result.",
      "I'm waiting for a clean breakout of the Creek before scaling in on leverage.",
      "Still think we could see one more shakeout to grab late longs before the real markup phase."
    ]
  },
  {
    topic: 'Technical - EURUSD Break & Retest',
    mainPost: "EURUSD finally broke out of this 3-day consolidation range. Classic break and retest of previous resistance turned support. Volume profile shows a clear high volume node holding price up.",
    imageUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80",
    comments: [
      "London session volume is backing this up. Good R:R on this setup.",
      "I'm long from 1.0820, targeting the weekly highs.",
      "Watch out for the ECB speakers later today, could spike the spread and hit stop losses."
    ]
  },
  {
    topic: 'Technical - BankNifty Options',
    mainPost: "BankNifty forming a symmetrical triangle on the 5-minute chart. RSI divergence on the lower timeframe suggests a breakdown. Keeping 45000 PE in watchlist.",
    imageUrl: "https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&q=80",
    comments: [
      "Bro IV crush will kill you if it doesn't break out before 1 PM.",
      "I'm seeing strong put writing at 44800, so downside might be limited.",
      "Wait for a 15-minute candle close below the trendline to avoid a fakeout."
    ],
    indianTarget: true
  },
  {
    topic: 'Technical - NASDAQ 100 Supply Zone',
    mainPost: "NDX (US100) tapping into the daily supply zone. Tech earnings might be the catalyst for a pullback here. Look at the bearish divergence on the MACD.",
    imageUrl: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?auto=format&fit=crop&q=80",
    comments: [
      "Agreed, but never short a dull market. Bulls are stubbornly holding this up.",
      "I scaled in some short positions here. Stop loss tight above the wick.",
      "Wait for cash open. Pre-market price action on indices is mostly noise."
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
    topic: 'Psychology - Winning Streak',
    mainPost: "Up 8% this week. I feel invincible but I know this is usually when I make a stupid mistake. How do you guys handle winning streaks?",
    comments: [
      "Lower your risk by half next week. You are emotionally compromised right now even if it feels good.",
      "Withdraw half the profits immediately. Make it real.",
      "Classic euphoria. Take tomorrow off."
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
    const body = await request.json();
    const { action, postId, content, type } = body;

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

    
    if (action === 'INJECT_COMMENT') {
      // Used postId and content from parsed body
      if (!postId) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });

      const { data: ghosts } = await supabaseAdmin.from('users').select('id').eq('is_ghost', true);
      if (!ghosts || ghosts.length === 0) return NextResponse.json({ error: 'No ghosts found' }, { status: 400 });

      const randomGhost = ghosts[Math.floor(Math.random() * ghosts.length)];
      
      const { error } = await supabaseAdmin.from('community_comments').insert({
        post_id: postId,
        author_id: randomGhost.id,
        content: content || "Great insight, following this!",
        is_mock: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Comment injected' });
    }

    
    
    if (action === 'QUEUE_SOCIAL_BATCH') {
      try {
        const { count = 10 } = body;
        
        const { data: ghosts } = await supabaseAdmin.from('users').select('id').eq('is_ghost', true);
        if (!ghosts || ghosts.length === 0) return NextResponse.json({ error: 'No ghosts found. Seed first.' }, { status: 400 });

        // Scrape from reliable Trading/Crypto RSS feeds (bypassing Reddit's 429/403 blocks)
        const Parser = require('rss-parser');
        const parser = new Parser();
        const feeds = [
          'https://www.tradingview.com/feed/',
          'https://cointelegraph.com/rss',
          'https://dailyhodl.com/feed/'
        ];
        
        let allPosts = [];
        
        const feedPromises = feeds.map(feedUrl => parser.parseURL(feedUrl).catch(e => {
            console.error(`Failed to fetch ${feedUrl}:`, e);
            return null;
        }));
        
        const results = await Promise.all(feedPromises);
        
        for (const feed of results) {
          if (!feed || !feed.items) continue;
          
          const valid = feed.items.map(item => {
            // Extract Image
            let imageUrl = null;
            const contentRaw = item['content:encoded'] || item.content || '';
            const imgMatches = [...contentRaw.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
            for (const match of imgMatches) {
              const src = match[1];
              if (src && !src.includes('userpics') && !src.includes('avatar')) {
                imageUrl = src;
                break;
              }
            }
            if (!imageUrl && imgMatches.length > 0) {
               imageUrl = imgMatches[0][1];
            }

            // Extract description text safely
            let text = item.title || 'Market Update';
            let description = item.description ? item.description.replace(/<[^>]+>/g, '').trim() : '';
            
            if (description && description.length > 10 && description.length < 500) {
              text += `\n\n${description}`;
            }

            return { text, imageUrl };
          });
          allPosts = allPosts.concat(valid);
        }

        if (allPosts.length === 0) {
          return NextResponse.json({ error: 'Failed to scrape social feeds' }, { status: 500 });
        }

        // Shuffle posts
        allPosts = allPosts.sort(() => 0.5 - Math.random()).slice(0, count);

        // Calculate baseline time
        const { data: latestGhostPost } = await supabaseAdmin
          .from('community_posts')
          .select('created_at')
          .eq('is_mock', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        let baseTime = Date.now();
        if (latestGhostPost && new Date(latestGhostPost.created_at).getTime() > baseTime) {
          baseTime = new Date(latestGhostPost.created_at).getTime();
        }

        let injectedCount = 0;

        for (const post of allPosts) {
          // Data already extracted from RSS
          let imageUrl = post.imageUrl;
          let text = post.text;

          const authorId = ghosts[Math.floor(Math.random() * ghosts.length)].id;
          
          // Space posts by 15-45 minutes
          const gapMinutes = Math.floor(Math.random() * 30) + 15;
          baseTime += gapMinutes * 60000;
          const postDate = new Date(baseTime).toISOString();

          const { data: newPost, error: postError } = await supabaseAdmin.from('community_posts').insert({
            author_id: authorId,
            content: text,
            category: 'General',
            image_url: imageUrl,
            is_mock: true,
            created_at: postDate,
            updated_at: postDate
          }).select().single();

          if (!postError) {
            injectedCount++;

            // Add 1-2 generic comments
            const GENERIC_COMMENTS = [
              "Interesting perspective.", "I saw something similar earlier.", 
              "Following this.", "What timeframe is this?", 
              "Volume confirms it.", "Be careful with upcoming news though.", 
              "Great spot!", "I totally agree with this.", "Tough market right now."
            ];
            
            const numComments = Math.floor(Math.random() * 2) + 1; // 1 to 2 comments
            let commentTime = baseTime;
            
            for (let i = 0; i < numComments; i++) {
              commentTime += (Math.floor(Math.random() * 5) + 1) * 60000; // 1-5 mins after post
              const commenterId = ghosts[Math.floor(Math.random() * ghosts.length)].id;
              
              await supabaseAdmin.from('community_comments').insert({
                post_id: newPost.id,
                author_id: commenterId,
                content: GENERIC_COMMENTS[Math.floor(Math.random() * GENERIC_COMMENTS.length)],
                is_mock: true,
                created_at: new Date(commentTime).toISOString(),
                updated_at: new Date(commentTime).toISOString()
              });
            }
          }
        }

        return NextResponse.json({ success: true, message: `Successfully queued ${injectedCount} real social posts into the future.` });
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    if (action === 'SCRAPE_TRADINGVIEW') {
      try {
        const Parser = require('rss-parser');
        const parser = new Parser();
        const feed = await parser.parseURL('https://www.tradingview.com/feed/');
        
        if (!feed.items || feed.items.length === 0) {
          return NextResponse.json({ error: 'No items in TradingView feed' }, { status: 400 });
        }

        const { data: ghosts } = await supabaseAdmin.from('users').select('id').eq('is_ghost', true);
        if (!ghosts || ghosts.length === 0) return NextResponse.json({ error: 'No ghosts found. Seed first.' }, { status: 400 });

        const shuffledItems = feed.items.sort(() => 0.5 - Math.random());
        const item = shuffledItems[0];

        const contentRaw = item['content:encoded'] || item.content || '';
        let imageUrl = null;
        const imgMatches = [...contentRaw.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
        for (const match of imgMatches) {
          const src = match[1];
          if (src && !src.includes('userpics')) {
            imageUrl = src;
            break;
          }
        }
        if (!imageUrl && imgMatches.length > 0) {
           imageUrl = imgMatches[0][1];
        }

        const title = item.title || 'Market Update';
        const description = item.description ? item.description.replace(/<[^>]+>/g, '') : '';
        const mainPostText = `${title}\n\n${description}`.trim();

        const shuffledGhosts = ghosts.sort(() => 0.5 - Math.random());
        const authorId = shuffledGhosts[0].id;

        const { data: latestGhostPost } = await supabaseAdmin
          .from('community_posts')
          .select('created_at')
          .eq('is_mock', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        let baseTime = Date.now();
        if (latestGhostPost && new Date(latestGhostPost.created_at).getTime() > baseTime) {
          baseTime = new Date(latestGhostPost.created_at).getTime();
        }
        
        const gapMinutes = Math.floor(Math.random() * 3) + 2; 
        const postDate = new Date(baseTime + gapMinutes * 60000).toISOString();

        const { data: newPost, error: postError } = await supabaseAdmin.from('community_posts').insert({
          author_id: authorId,
          content: mainPostText,
          category: 'General',
          image_url: imageUrl,
          is_mock: true,
          created_at: postDate,
          updated_at: postDate
        }).select().single();

        if (postError) throw postError;

        const GENERIC_COMMENTS = [
          "Great analysis! I'm watching this exact level closely.",
          "What indicator are you using for this?",
          "Agreed, but watch out for the upcoming news data.",
          "I took a similar position yesterday, let's see how it plays out.",
          "This is exactly what I was looking for, thanks!",
          "Interesting perspective. I have a slightly different view on the 4H but this makes sense.",
          "Volume profile confirms this as well.",
          "Good risk to reward ratio here."
        ];
        
        const selectedComments = GENERIC_COMMENTS.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);

        let currentCommentTime = new Date(postDate).getTime();
        for (let i = 0; i < selectedComments.length; i++) {
          const commentGap = Math.floor(Math.random() * 3) + 1;
          currentCommentTime += commentGap * 60000;
          const commenterId = shuffledGhosts[(i % (shuffledGhosts.length - 1)) + 1].id;
          const commentDate = new Date(currentCommentTime).toISOString();
          
          await supabaseAdmin.from('community_comments').insert({
            post_id: newPost.id,
            author_id: commenterId,
            content: selectedComments[i],
            is_mock: true,
            created_at: commentDate,
            updated_at: commentDate
          });
        }

        return NextResponse.json({ success: true, message: `Successfully scraped and injected: "${title}"` });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Scraping failed' }, { status: 500 });
      }
    }

    if (action === 'INJECT_THREAD') {
      // 1. Get all ghosts
      const { data: ghosts } = await supabaseAdmin.from('users').select('id').eq('is_ghost', true);
      if (!ghosts || ghosts.length === 0) return NextResponse.json({ error: 'No ghosts found. Seed first.' }, { status: 400 });

      // 2. Pick a scenario
      // Used type from parsed body
      let validScenarios = SCENARIOS;
      
      if (type === 'IMAGE') {
        validScenarios = SCENARIOS.filter(s => s.imageUrl);
      } else if (type === 'NORMAL') {
        validScenarios = SCENARIOS.filter(s => !s.imageUrl);
      }
      
      if (validScenarios.length === 0) validScenarios = SCENARIOS; // Fallback
      const scenario = validScenarios[Math.floor(Math.random() * validScenarios.length)];

      // 3. Shuffle ghosts
      const shuffledGhosts = ghosts.sort(() => 0.5 - Math.random());
      const authorId = shuffledGhosts[0].id;
      
      // 4. Time Calculation (Queue system)
      const { data: latestGhostPost } = await supabaseAdmin
        .from('community_posts')
        .select('created_at')
        .eq('is_mock', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      let baseTime = Date.now();
      if (latestGhostPost && new Date(latestGhostPost.created_at).getTime() > baseTime) {
        baseTime = new Date(latestGhostPost.created_at).getTime();
      }
      
      const gapMinutes = Math.floor(Math.random() * 3) + 2; // 2 to 4 minutes gap
      const postDate = new Date(baseTime + gapMinutes * 60000).toISOString();

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

      // 5. Create Comments
      const { error: checkTableError } = await supabaseAdmin.from('community_comments').select('id').limit(1);
      
      if (!checkTableError || checkTableError.code !== '42P01') {
        let currentCommentTime = new Date(postDate).getTime();
        
        for (let i = 0; i < scenario.comments.length; i++) {
          const commentGap = Math.floor(Math.random() * 3) + 1; // 1 to 3 mins after previous action
          currentCommentTime += commentGap * 60000;
          
          const commenterId = shuffledGhosts[(i % (shuffledGhosts.length - 1)) + 1].id;
          const commentDate = new Date(currentCommentTime).toISOString();
          
          await supabaseAdmin.from('community_comments').insert({
            post_id: newPost.id,
            author_id: commenterId,
            content: scenario.comments[i],
            is_mock: true,
            created_at: commentDate,
            updated_at: commentDate
          });
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
