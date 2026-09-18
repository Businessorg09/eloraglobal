import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || userData.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'cron_schedule')
      .single();

    if (error || !data) {
      return NextResponse.json({ closingDay: 'SUNDAY', closingTime: '23:59' });
    }
    
    const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || userData.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { closingDay, closingTime } = body;

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('platform_settings')
      .upsert({ 
        key: 'cron_schedule', 
        value: { closingDay, closingTime }
      }, { onConflict: 'key' });

    if (error) throw error;
    
    return NextResponse.json({ success: true, closingDay, closingTime });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
