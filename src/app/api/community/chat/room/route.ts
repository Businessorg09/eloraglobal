import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// POST: Create or Get a 1-on-1 direct message room between logged-in user and target user
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          }
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing target user ID' }, { status: 400 });
    }

    // Check if a 1-on-1 room already exists between these two users
    // This is tricky because we have chat_rooms and chat_participants
    // Easiest way: Find a room where BOTH users are participants and is_group = false.
    // For simplicity in Postgres without complex joins, we can query chat_participants
    // for rooms the current user is in, then check if target is also in it.
    
    const { data: myRooms, error: myRoomsError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', user.id);
      
    if (myRoomsError) throw myRoomsError;

    if (myRooms && myRooms.length > 0) {
      const roomIds = myRooms.map(r => r.room_id);
      
      const { data: commonRooms, error: commonRoomsError } = await supabase
        .from('chat_participants')
        .select('room_id, room:chat_rooms!inner(is_group)')
        .eq('user_id', targetUserId)
        .in('room_id', roomIds)
        .eq('room.is_group', false);
        
      if (commonRoomsError) throw commonRoomsError;

      if (commonRooms && commonRooms.length > 0) {
        // Room already exists! Return the first one.
        return NextResponse.json({ roomId: commonRooms[0].room_id });
      }
    }

    // Room doesn't exist, create a new one
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('username, full_name')
      .eq('id', targetUserId)
      .single();

    if (targetError) throw targetError;

    const { data: meUser, error: meError } = await supabase
      .from('users')
      .select('username, full_name')
      .eq('id', user.id)
      .single();
      
    if (meError) throw meError;

    // Create the room
    const { data: newRoom, error: createRoomError } = await supabase
      .from('chat_rooms')
      .insert({
        is_group: false,
        name: 'Direct Message' // For 1-on-1s, the UI resolves the name
      })
      .select('id')
      .single();

    if (createRoomError) throw createRoomError;

    // Add both participants
    const { error: addParticipantsError } = await supabase
      .from('chat_participants')
      .insert([
        { room_id: newRoom.id, user_id: user.id },
        { room_id: newRoom.id, user_id: targetUserId }
      ]);

    if (addParticipantsError) throw addParticipantsError;

    return NextResponse.json({ roomId: newRoom.id });

  } catch (error: any) {
    console.error('Chat Room POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
