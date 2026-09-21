import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: nodes } = await supabase.from('binary_nodes').select('id, user_id, users(full_name)').limit(3);
  console.log('Nodes:', nodes);
  
  if (nodes && nodes.length > 0) {
    const { data: vols } = await supabase.from('binary_node_volumes').select('*').eq('node_id', nodes[0].id);
    console.log('Volumes for node 1:', vols);
    const { data: vols2 } = await supabase.from('binary_node_volumes').select('*').limit(3);
    console.log('Any volumes:', vols2);
  }
}
run();
