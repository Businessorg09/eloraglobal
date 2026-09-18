import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET – public read (no auth needed for frontend to load config)
export async function GET(request: Request) {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'live_room_config')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ config: null });
      }
      console.error('[live-room GET]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let configValue = data.value;
    if (typeof configValue === 'string') {
      try { configValue = JSON.parse(configValue); } catch(e) {}
    }
    
    // Clean up corrupted string spread keys (numeric keys like '0', '1', etc.)
    if (configValue && typeof configValue === 'object' && !Array.isArray(configValue)) {
      const cleanConfig: any = {};
      for (const key in configValue) {
        // If the key is not just numbers, it's a real key (e.g. 'liveZoom', 'masterclasses')
        if (isNaN(Number(key))) {
          cleanConfig[key] = configValue[key];
        }
      }
      configValue = cleanConfig;
    }

    return NextResponse.json({ config: configValue });
  } catch (err: any) {
    console.error('[live-room GET] exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT – admin save (uses service-role client to avoid session cookie issues)
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.config) {
      return NextResponse.json({ error: 'No config provided in request body' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('platform_settings')
      .upsert(
        { key: 'live_room_config', value: body.config },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('[live-room PUT] Supabase error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[live-room PUT] exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
