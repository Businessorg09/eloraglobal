import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'academy-videos';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET_NAME);
  if (!exists) {
    await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 524288000, // 500MB
      allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'image/png', 'image/jpeg', 'image/webp']
    });
  }
}

// This route generates a signed upload URL so the browser can upload directly to Supabase Storage
// This bypasses Vercel's 4.5MB payload limit entirely
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { fileName, fileType, type } = await request.json();
    
    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    await ensureBucket();

    // Generate unique file path
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
    const folder = type === 'thumbnail' ? 'thumbnail' : 'video';
    const filePath = folder + '/' + timestamp + '_' + safeName;

    // Create a signed upload URL (valid for 10 minutes)
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(filePath);

    if (signedError) {
      console.error('Signed URL error:', signedError);
      return NextResponse.json({ error: 'Failed to create upload URL: ' + signedError.message }, { status: 500 });
    }

    // Get the public URL for after upload completes
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({
      signedUrl: signedData.signedUrl,
      token: signedData.token,
      path: signedData.path,
      publicUrl: urlData.publicUrl,
      filePath: filePath
    });

  } catch (error: any) {
    console.error('Upload URL error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
