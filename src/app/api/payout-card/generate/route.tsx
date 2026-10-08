import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { ImageResponse } from 'next/og'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
// We use nodejs runtime because we use fs to read local fonts/images.

export async function POST(request: Request) {
  try {
    const { payoutId } = await request.json()
    if (!payoutId) return NextResponse.json({ error: 'Missing payoutId' }, { status: 400 })

    const adminDb = createAdminClient()

    // 1. Fetch withdrawal
    const { data: withdrawal, error: wError } = await adminDb
      .from('withdrawals')
      .select('*')
      .eq('id', payoutId)
      .single()

    if (wError || !withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found: ' + (wError?.message || 'No data') }, { status: 404 })
    }
    
    // 1.b Fetch user data separately to avoid PostgREST foreign key ambiguity
    const { data: userData } = await adminDb.from('users').select('full_name, username, referral_code').eq('id', withdrawal.user_id).single();
    withdrawal.users = userData;

    // Removed COMPLETED check so users can share pending certificates

    const user = withdrawal.users
    const method = withdrawal.method || (withdrawal.net_payable_paise ? 'Bank Transfer' : 'USDT')
    
    // Check if it's INR or USD based on method or some flag. We'll default to USD if USDT, else INR.
    const isCrypto = method.toLowerCase().includes('usdt') || method.toLowerCase().includes('crypto')
    const symbol = isCrypto ? '
    
    // For INR, the amount is usually in paise. For Crypto, it might be in cents or just direct value.
    // Assuming net_payable_paise is in paise (divide by 100).
    const rawAmount = withdrawal.net_payable_paise / 100
    // Format amount cleanly
    const formattedAmount = isCrypto 
      ? rawAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : rawAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const date = new Date(withdrawal.processed_at || withdrawal.created_at)
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eloraglobal.com'
    const referralCode = user?.referral_code || user?.username || 'user'
    const referralUrl = `${appUrl}/r/${referralCode}?source=payout&payout=${payoutId}`

    const qrDataUrl = await QRCode.toDataURL(referralUrl, { margin: 1, width: 200, color: { dark: '#000000', light: '#FFFFFF' } })

    // Load logo
    let logoUrl = ''
    try {
      const logoData = fs.readFileSync(path.join(process.cwd(), 'src/assets/payout-card/logo.png'))
      logoUrl = `data:image/png;base64,${logoData.toString('base64')}`
    } catch(e) {}

    // Load fonts
    const inter400 = fs.readFileSync(path.join(process.cwd(), 'src/assets/fonts/Inter-400.woff'))
    const inter500 = fs.readFileSync(path.join(process.cwd(), 'src/assets/fonts/Inter-500.woff'))
    const inter600 = fs.readFileSync(path.join(process.cwd(), 'src/assets/fonts/Inter-600.woff'))
    const inter700 = fs.readFileSync(path.join(process.cwd(), 'src/assets/fonts/Inter-700.woff'))

    // Load Avatars
    const avatarUrls = [1, 2, 3, 4].map(n => {
      try {
        const data = fs.readFileSync(path.join(process.cwd(), `src/assets/payout-card/avatar-${n}.jpg`))
        return `data:image/jpeg;base64,${data.toString('base64')}`
      } catch(e) { return '' }
    })

    // Construct the UI elements exactly mimicking the image
    const element = (
      <div style={{ display: 'flex',
        width: 1080,
        height: 1350,
        background: 'linear-gradient(135deg, #0b3a99 0%, #001233 40%, #000a1f 100%)',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter',
        color: 'white',
      }}>
        {/* Top Text */}
        <div style={{ display: 'flex', width: 900, justifyContent: 'space-between', marginBottom: 30, fontSize: 32, color: '#e2e8f0', zIndex: 10 }}>
          <div style={{ display: 'flex' }}>Trader Win</div>
          <div style={{ display: 'flex' }}>{date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}</div>
        </div>

        {/* Main 3D Card Container */}
        <div style={{ display: 'flex',
          flexDirection: 'column',
          width: 900,
          backgroundColor: '#0f172a',
          borderRadius: 60,
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden'
        }}>
          
          {/* Top Blue Gradient Section */}
          <div style={{ display: 'flex',
            flexDirection: 'column',
            padding: '40px 50px 70px 50px',
            background: 'linear-gradient(to bottom, #1e40af, #2563eb)',
            position: 'relative',
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            zIndex: 5
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {logoUrl && <img src={logoUrl} width={50} height={50} style={{ borderRadius: 25, backgroundColor: 'white', padding: 5 }} />}
                <div style={{ display: 'flex', fontSize: 32, fontWeight: 600 }}>Elora Global</div>
              </div>
              <div style={{ display: 'flex', width: 50, height: 50, borderRadius: 25, 
                backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
                fontSize: 24, paddingBottom: 15
              }}>...</div>
            </div>

            {/* Paid Out Pill */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
              <div style={{ display: 'flex', padding: '12px 30px', borderRadius: 40,
                backgroundColor: 'rgba(255,255,255,0.2)', fontSize: 24, fontWeight: 700,
                letterSpacing: 1.5, border: '1px solid rgba(255,255,255,0.1)'
              }}>{withdrawal.status === 'COMPLETED' ? 'PAID OUT' : 'PROCESSING'}</div>
            </div>

            {/* Amount */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30, fontSize: 110, fontWeight: 800 }}>
              <div style={{ display: 'flex', marginRight: 20 }}>{symbol}</div>
              <div style={{ display: 'flex' }}>{formattedAmount}</div>
            </div>

            {/* Avatars Overlapping */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30, position: 'absolute', bottom: -45, left: 0, right: 0 }}>
              {avatarUrls.filter(u=>u).map((url, i) => (
                <img key={i} src={url} width={90} height={90} style={{ 
                  borderRadius: 45, marginLeft: i === 0 ? 0 : -25, 
                  border: '5px solid #0f172a', zIndex: 10 - i, objectFit: 'cover'
                }} />
              ))}
              {/* Extra avatar to make 5 */}
              {avatarUrls[0] && (
                <img src={avatarUrls[0]} width={90} height={90} style={{ 
                  borderRadius: 45, marginLeft: -25, 
                  border: '5px solid #0f172a', zIndex: 1, objectFit: 'cover'
                }} />
              )}
            </div>
          </div>

          {/* Lower Content Section */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '90px 50px 40px 50px', zIndex: 1 }}>
            
            {/* Last Transaction Box */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '30px',
              backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 30,
              border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 22, marginBottom: 20 }}>
                <div style={{ display: 'flex' }}>Last transaction</div>
                <div style={{ display: 'flex', textDecoration: 'underline' }}>View all</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ display: 'flex', width: 70, height: 70, borderRadius: 35, backgroundColor: '#020617', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {logoUrl && <img src={logoUrl} width={40} height={40} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: 'white' }}>Elora Global Withdrawal</div>
                    <div style={{ display: 'flex', fontSize: 20, color: '#94a3b8' }}>{formattedDate} • {formattedTime} &nbsp;&nbsp; Method: {method}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>
                  {symbol}{formattedAmount}
                </div>
              </div>
            </div>

            {/* User Info Box */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px',
              backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 30,
              border: '1px solid rgba(255,255,255,0.05)', marginBottom: 30
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <img src={avatarUrls[0]} width={90} height={90} style={{ borderRadius: 45 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', fontSize: 28, fontWeight: 700 }}>User: @{user?.username || 'Trader'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, color: '#94a3b8' }}>
                    <div style={{ display: 'flex' }}>Verified Trader</div>
                    <div style={{ display: 'flex', width: 24, height: 24, borderRadius: 12, backgroundColor: '#3b82f6', color: 'white', justifyContent: 'center', alignItems: 'center', fontSize: 16 }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, border: '1px solid rgba(255,255,255,0.1)', padding: 10, borderRadius: 20, backgroundColor: '#020617' }}>
                <img src={qrDataUrl} width={80} height={80} style={{ borderRadius: 10 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8', fontSize: 16 }}>
                  <div style={{ display: 'flex', marginBottom: 5 }}>[  ]</div>
                  <div style={{ display: 'flex' }}>Scan</div>
                  <div style={{ display: 'flex' }}>referral</div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Gear */}
              <div style={{ display: 'flex', width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', fontSize: 32 }}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
              {/* Transfer */}
              <div style={{ display: 'flex', width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', fontSize: 32 }}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg></div>
              {/* Post */}
              <div style={{ display: 'flex', width: 240, height: 80, borderRadius: 40, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', fontSize: 28, gap: 10 }}>
                Post <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </div>
              {/* Received */}
              <div style={{ display: 'flex', width: 280, height: 80, borderRadius: 40, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', fontSize: 28, fontWeight: 600, gap: 10, boxShadow: '0 10px 20px rgba(59,130,246,0.3)' }}>
                Received 
                <span style={{ border: '2px solid white', borderRadius: 20, padding: 2, fontSize: 18 }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Footer Text */}
        <div style={{ display: 'flex', width: 900, justifyContent: 'space-between', marginTop: 40, fontSize: 24, color: '#e2e8f0' }}>
          <div style={{ display: 'flex' }}>@eloraglobal</div>
          <div style={{ display: 'flex' }}>Payout received</div>
        </div>

      </div>
    )

    const response = new ImageResponse(element, {
      width: 1080,
      height: 1350,
      fonts: [
        { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
        { name: 'Inter', data: inter500, weight: 500, style: 'normal' },
        { name: 'Inter', data: inter600, weight: 600, style: 'normal' },
        { name: 'Inter', data: inter700, weight: 700, style: 'normal' },
      ],
    })

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Save to Supabase Storage
    const fileName = `${payoutId}.png`
    const { error: uploadError } = await adminDb.storage.from('payouts').upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true
    })

    if (uploadError) {
      await adminDb.from('withdrawals').update({ share_card_status: 'FAILED' }).eq('id', payoutId)
      return NextResponse.json({ error: 'Failed to upload image', details: uploadError }, { status: 500 })
    }

    const { data: { publicUrl } } = adminDb.storage.from('payouts').getPublicUrl(fileName)

    await adminDb.from('withdrawals').update({
      share_card_url: publicUrl,
      share_card_status: 'READY',
      share_card_generated_at: new Date().toISOString()
    }).eq('id', payoutId)

    return NextResponse.json({ success: true, url: publicUrl })

  } catch (error: any) {
    console.error('Generate Payout Card Error:', error)
    return NextResponse.json({ error: 'Generation Error: ' + (error?.message || error?.toString()) }, { status: 500 })
  }
}
 : 'INR '
    
    // For INR, the amount is usually in paise. For Crypto, it might be in cents or just direct value.
    // Assuming net_payable_paise is in paise (divide by 100).
    const rawAmount = withdrawal.net_payable_paise / 100
    // Format amount cleanly
    const formattedAmount = isCrypto 
      ? rawAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : rawAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const date = new Date(withdrawal.processed_at || withdrawal.created_at)
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eloraglobal.com'
    const referralCode = user?.referral_code || user?.username || 'user'
    const referralUrl = `${appUrl}/r/${referralCode}?source=payout&payout=${payoutId}`

    const qrDataUrl = await QRCode.toDataURL(referralUrl, { margin: 1, width: 200, color: { dark: '#000000', light: '#FFFFFF' } })

    // Load logo
    let logoUrl = ''
    try {
      const logoData = fs.readFileSync(path.join(process.cwd(), 'src/assets/payout-card/logo.png'))
      logoUrl = `data:image/png;base64,${logoData.toString('base64')}`
    } catch(e) {}

    // Load fonts
    const inter400 = fs.readFileSync(path.join(process.cwd(), 'src/assets/fonts/Inter-400.woff'))
    const inter500 = fs.readFileSync(path.join(process.cwd(), 'src/assets/fonts/Inter-500.woff'))
    const inter600 = fs.readFileSync(path.join(process.cwd(), 'src/assets/fonts/Inter-600.woff'))
    const inter700 = fs.readFileSync(path.join(process.cwd(), 'src/assets/fonts/Inter-700.woff'))

    // Load Avatars
    const avatarUrls = [1, 2, 3, 4].map(n => {
      try {
        const data = fs.readFileSync(path.join(process.cwd(), `src/assets/payout-card/avatar-${n}.jpg`))
        return `data:image/jpeg;base64,${data.toString('base64')}`
      } catch(e) { return '' }
    })

    // Construct the UI elements exactly mimicking the image
    const element = (
      <div style={{ display: 'flex',
        width: 1080,
        height: 1350,
        background: 'linear-gradient(135deg, #0b3a99 0%, #001233 40%, #000a1f 100%)',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter',
        color: 'white',
      }}>
        {/* Top Text */}
        <div style={{ display: 'flex', width: 900, justifyContent: 'space-between', marginBottom: 30, fontSize: 32, color: '#e2e8f0', zIndex: 10 }}>
          <div style={{ display: 'flex' }}>Trader Win</div>
          <div style={{ display: 'flex' }}>{date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}</div>
        </div>

        {/* Main 3D Card Container */}
        <div style={{ display: 'flex',
          flexDirection: 'column',
          width: 900,
          backgroundColor: '#0f172a',
          borderRadius: 60,
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden'
        }}>
          
          {/* Top Blue Gradient Section */}
          <div style={{ display: 'flex',
            flexDirection: 'column',
            padding: '40px 50px 70px 50px',
            background: 'linear-gradient(to bottom, #1e40af, #2563eb)',
            position: 'relative',
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            zIndex: 5
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {logoUrl && <img src={logoUrl} width={50} height={50} style={{ borderRadius: 25, backgroundColor: 'white', padding: 5 }} />}
                <div style={{ display: 'flex', fontSize: 32, fontWeight: 600 }}>Elora Global</div>
              </div>
              <div style={{ display: 'flex', width: 50, height: 50, borderRadius: 25, 
                backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
                fontSize: 24, paddingBottom: 15
              }}>...</div>
            </div>

            {/* Paid Out Pill */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
              <div style={{ display: 'flex', padding: '12px 30px', borderRadius: 40,
                backgroundColor: 'rgba(255,255,255,0.2)', fontSize: 24, fontWeight: 700,
                letterSpacing: 1.5, border: '1px solid rgba(255,255,255,0.1)'
              }}>{withdrawal.status === 'COMPLETED' ? 'PAID OUT' : 'PROCESSING'}</div>
            </div>

            {/* Amount */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30, fontSize: 110, fontWeight: 800 }}>
              <div style={{ display: 'flex', marginRight: 20 }}>{symbol}</div>
              <div style={{ display: 'flex' }}>{formattedAmount}</div>
            </div>

            {/* Avatars Overlapping */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30, position: 'absolute', bottom: -45, left: 0, right: 0 }}>
              {avatarUrls.filter(u=>u).map((url, i) => (
                <img key={i} src={url} width={90} height={90} style={{ 
                  borderRadius: 45, marginLeft: i === 0 ? 0 : -25, 
                  border: '5px solid #0f172a', zIndex: 10 - i, objectFit: 'cover'
                }} />
              ))}
              {/* Extra avatar to make 5 */}
              {avatarUrls[0] && (
                <img src={avatarUrls[0]} width={90} height={90} style={{ 
                  borderRadius: 45, marginLeft: -25, 
                  border: '5px solid #0f172a', zIndex: 1, objectFit: 'cover'
                }} />
              )}
            </div>
          </div>

          {/* Lower Content Section */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '90px 50px 40px 50px', zIndex: 1 }}>
            
            {/* Last Transaction Box */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '30px',
              backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 30,
              border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 22, marginBottom: 20 }}>
                <div style={{ display: 'flex' }}>Last transaction</div>
                <div style={{ display: 'flex', textDecoration: 'underline' }}>View all</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ display: 'flex', width: 70, height: 70, borderRadius: 35, backgroundColor: '#020617', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {logoUrl && <img src={logoUrl} width={40} height={40} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: 'white' }}>Elora Global Withdrawal</div>
                    <div style={{ display: 'flex', fontSize: 20, color: '#94a3b8' }}>{formattedDate} • {formattedTime} &nbsp;&nbsp; Method: {method}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>
                  {symbol}{formattedAmount}
                </div>
              </div>
            </div>

            {/* User Info Box */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px',
              backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 30,
              border: '1px solid rgba(255,255,255,0.05)', marginBottom: 30
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <img src={avatarUrls[0]} width={90} height={90} style={{ borderRadius: 45 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', fontSize: 28, fontWeight: 700 }}>User: @{user?.username || 'Trader'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, color: '#94a3b8' }}>
                    <div style={{ display: 'flex' }}>Verified Trader</div>
                    <div style={{ display: 'flex', width: 24, height: 24, borderRadius: 12, backgroundColor: '#3b82f6', color: 'white', justifyContent: 'center', alignItems: 'center', fontSize: 16 }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, border: '1px solid rgba(255,255,255,0.1)', padding: 10, borderRadius: 20, backgroundColor: '#020617' }}>
                <img src={qrDataUrl} width={80} height={80} style={{ borderRadius: 10 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8', fontSize: 16 }}>
                  <div style={{ display: 'flex', marginBottom: 5 }}>[  ]</div>
                  <div style={{ display: 'flex' }}>Scan</div>
                  <div style={{ display: 'flex' }}>referral</div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Gear */}
              <div style={{ display: 'flex', width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', fontSize: 32 }}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
              {/* Transfer */}
              <div style={{ display: 'flex', width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', fontSize: 32 }}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg></div>
              {/* Post */}
              <div style={{ display: 'flex', width: 240, height: 80, borderRadius: 40, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', fontSize: 28, gap: 10 }}>
                Post <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </div>
              {/* Received */}
              <div style={{ display: 'flex', width: 280, height: 80, borderRadius: 40, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', fontSize: 28, fontWeight: 600, gap: 10, boxShadow: '0 10px 20px rgba(59,130,246,0.3)' }}>
                Received 
                <span style={{ border: '2px solid white', borderRadius: 20, padding: 2, fontSize: 18 }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Footer Text */}
        <div style={{ display: 'flex', width: 900, justifyContent: 'space-between', marginTop: 40, fontSize: 24, color: '#e2e8f0' }}>
          <div style={{ display: 'flex' }}>@eloraglobal</div>
          <div style={{ display: 'flex' }}>Payout received</div>
        </div>

      </div>
    )

    const response = new ImageResponse(element, {
      width: 1080,
      height: 1350,
      fonts: [
        { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
        { name: 'Inter', data: inter500, weight: 500, style: 'normal' },
        { name: 'Inter', data: inter600, weight: 600, style: 'normal' },
        { name: 'Inter', data: inter700, weight: 700, style: 'normal' },
      ],
    })

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Save to Supabase Storage
    const fileName = `${payoutId}.png`
    const { error: uploadError } = await adminDb.storage.from('payouts').upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true
    })

    if (uploadError) {
      await adminDb.from('withdrawals').update({ share_card_status: 'FAILED' }).eq('id', payoutId)
      return NextResponse.json({ error: 'Failed to upload image', details: uploadError }, { status: 500 })
    }

    const { data: { publicUrl } } = adminDb.storage.from('payouts').getPublicUrl(fileName)

    await adminDb.from('withdrawals').update({
      share_card_url: publicUrl,
      share_card_status: 'READY',
      share_card_generated_at: new Date().toISOString()
    }).eq('id', payoutId)

    return NextResponse.json({ success: true, url: publicUrl })

  } catch (error: any) {
    console.error('Generate Payout Card Error:', error)
    return NextResponse.json({ error: 'Generation Error: ' + (error?.message || error?.toString()) }, { status: 500 })
  }
}
