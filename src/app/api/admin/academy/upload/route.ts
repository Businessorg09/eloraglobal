import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// This is critical - tells Next.js to NOT pre-parse the request body
export const runtime = 'nodejs';

const BUCKET_NAME = 'academy-videos';

// Admin-level client for storage operations (bypasses RLS)
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

export async function POST(request: Request) {
  try {
    // Auth check
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

    // Parse FormData from the request
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError: any) {
      console.error('FormData parse error:', parseError);
      return NextResponse.json({ error: 'Request Entity Too Large or invalid form data. Max file size: 500MB.' }, { status: 413 });
    }

    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'video';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (500MB max)
    if (file.size > 524288000) {
      return NextResponse.json({ error: 'File too large. Maximum size is 500MB.' }, { status: 413 });
    }

    // Ensure bucket exists
    await ensureBucket();

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
    const filePath = type + '/' + timestamp + '_' + safeName;

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      success: true, 
      url: urlData.publicUrl,
      path: filePath,
      size: file.size,
      name: file.name
    });

  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
