import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    let currentLevelIds = [user.id];
    let allMembers: any[] = [];
    let currentLevel = 1;
    
    // Safety break at 100 levels to prevent infinite loops if data is malformed
    while (currentLevelIds.length > 0 && currentLevel <= 100) {
      const { data: levelMembers, error } = await adminClient
        .from('users')
        .select('id, username, full_name, referred_position, created_at')
        .in('referred_by', currentLevelIds)
        .order('created_at', { ascending: false });

      if (error || !levelMembers || levelMembers.length === 0) {
        break; // No more downlines found
      }

      const mappedMembers = levelMembers.map(m => ({ ...m, level: currentLevel }));
      allMembers = [...allMembers, ...mappedMembers];
      
      currentLevelIds = levelMembers.map(m => m.id);
      currentLevel++;
    }
    
    // Sort overall by created_at desc
    allMembers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Batch fetch binary nodes and ranks for performance
    const allIds = allMembers.map(m => m.id);
    let nodeMap = new Map();
    let rankMap = new Map();

    if (allIds.length > 0) {
      const { data: nodes } = await adminClient
        .from('binary_nodes')
        .select('user_id, is_active, position')
        .in('user_id', allIds);
        
      const { data: ranks } = await adminClient
        .from('user_ranks')
        .select('user_id, current_rank')
        .in('user_id', allIds);
        
      nodeMap = new Map((nodes || []).map(n => [n.user_id, n]));
      rankMap = new Map((ranks || []).map(r => [r.user_id, r]));
    }

    const members = allMembers.map((member) => {
      const node = nodeMap.get(member.id);
      const rank = rankMap.get(member.id);
      
      return {
        id: member.id,
        username: member.username,
        full_name: member.full_name,
        referred_position: member.referred_position,
        current_rank: rank?.current_rank || 'BRONZE',
        has_active_node: !!(node && node.is_active),
        joined_at: member.created_at,
        level: member.level
      };
    });

    return NextResponse.json({
      members,
      total: members.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
