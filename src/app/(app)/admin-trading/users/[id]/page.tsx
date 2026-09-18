import { createAdminClient } from '@/lib/supabase/admin'
import UserDossier from './UserDossier'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MemberDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const adminDb = createAdminClient()
  const { id } = await params;
  
  const { data: user, error } = await adminDb
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error || !user) {
    return notFound()
  }

  // Fetch Tree Node info
  const { data: treeNode } = await adminDb
    .from('binary_nodes')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let parentNode = null;
  if (treeNode?.parent_id) {
    const { data: parent } = await adminDb
      .from('binary_nodes')
      .select('user_id')
      .eq('id', treeNode.parent_id)
      .single()
      
    if (parent?.user_id) {
      const { data: pUser } = await adminDb
        .from('users')
        .select('full_name, username')
        .eq('id', parent.user_id)
        .single()
      parentNode = pUser
    }
  }

  // Fetch Auth Meta for Bank & PIN
  const { data: authUser } = await adminDb.auth.admin.getUserById(user.id)
  const authMeta = authUser?.user?.user_metadata || {}

  // Fetch Wallet
  const { data: wallet } = await adminDb.from('wallets').select('*').eq('user_id', user.id).single()

  // Fetch Rank
  const { data: rank } = await adminDb.from('user_ranks').select('*').eq('user_id', id).single()

  // Fetch Direct Referrals Count
  const { count: directReferrals } = await adminDb.from('users').select('id', { count: 'exact', head: true }).eq('referred_by', id)

  // Fetch Transactions Ledger
  const { data: transactions } = await adminDb.from('transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(100)

  // Fetch Current Sponsor Details
  let sponsorUser = null;
  if (user.referred_by) {
    const { data: s } = await adminDb.from('users').select('id, full_name, email').eq('id', user.referred_by).single();
    sponsorUser = s;
  }

  return <UserDossier 
    user={user} 
    treeNode={treeNode} 
    parentNode={parentNode} 
    authMeta={authMeta} 
    wallet={wallet} 
    rank={rank} 
    directReferralsCount={directReferrals || 0}
    transactions={transactions || []}
    currentSponsor={sponsorUser}
  />
}
