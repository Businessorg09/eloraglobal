import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    
    if (roomId) {
      // Fetch messages for a specific room
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*, sender:users(id, username, full_name)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return NextResponse.json({ messages });
    } else {
      // Fetch all rooms for the current user
      const { data: rooms, error } = await supabase
        .from('chat_participants')
        .select('room_id, room:chat_rooms(name, is_group)')
        .eq('user_id', user.id);
        
      if (error) throw error;
      return NextResponse.json({ rooms: rooms.map(r => ({ id: r.room_id, name: (r.room as any)?.name, isGroup: (r.room as any)?.is_group })) });
    }

  } catch (error: any) {
    console.error('Chat GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, content } = await request.json();

    if (!roomId || !content) {
      return NextResponse.json({ error: 'Room and content are required' }, { status: 400 });
    }

    // Verify user is in the room
    const { data: participant } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();
      
    if (!participant) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content: content
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Chat POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
