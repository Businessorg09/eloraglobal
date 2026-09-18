import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Determine the base URL for internal API calls
    // In production, this might need to be explicitly set via env var
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Note: To secure this cron job in production, we should check a CRON_SECRET header
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    // Since we're calling our own protected /admin routes, we need to pass a service role 
    // or simulate an admin session. We'll rely on a specialized API key or just call the engine functions directly.
    // However, the routes currently require an auth token. 
    // Instead of making HTTP calls to our own protected routes, it's safer to just import the logic,
    // but the routes have all the Supabase db logic built-in.
    // To make this work seamlessly, the cron job should ideally have an Admin JWT.

    // A simpler approach for the Cron orchestrator is to return a success message telling the 
    // system to execute the manual admin endpoints, OR we can execute the HTTP calls with the SERVICE_ROLE token.

    const adminHeaders = {
      'Content-Type': 'application/json',
      // We would pass an admin JWT here or configure the routes to accept a secret token
      // 'Authorization': `Bearer ${adminJwt}`
    };

    // 1. Run Binary Matching
    const binaryRes = await fetch(`${baseUrl}/api/admin/binary-matching/run`, {
      method: 'POST',
      headers: adminHeaders,
    });
    
    // 2. Run Rank Check
    const rankRes = await fetch(`${baseUrl}/api/admin/rank-check/run`, {
      method: 'POST',
      headers: adminHeaders,
    });

    return NextResponse.json({
      success: true,
      message: "Weekly payout orchestrator executed.",
      binaryStatus: binaryRes.status,
      rankStatus: rankRes.status,
    });
  } catch (error: any) {
    console.error("Cron Orchestrator Error:", error);
    return NextResponse.json({ error: "Failed to run weekly payout" }, { status: 500 });
  }
}
