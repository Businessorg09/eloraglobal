-- 1. Modify users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS warning_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS muted_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'ACTIVE';

-- 2. Modify community_posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- 3. Create community_settings table
CREATE TABLE IF NOT EXISTS community_settings (
  id INT PRIMARY KEY DEFAULT 1,
  global_chat_locked BOOLEAN DEFAULT false,
  media_uploads_allowed BOOLEAN DEFAULT true,
  manual_post_approval BOOLEAN DEFAULT false
);

-- Insert default row if not exists
INSERT INTO community_settings (id, global_chat_locked, media_uploads_allowed, manual_post_approval)
VALUES (1, false, true, false)
ON CONFLICT (id) DO NOTHING;

-- 4. Create admin_blacklisted_words table
CREATE TABLE IF NOT EXISTS admin_blacklisted_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(255) NOT NULL,
  action VARCHAR(50) DEFAULT 'DELETE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS is appropriate (admins only for settings and blacklist, public read for settings)
ALTER TABLE community_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read community settings" ON community_settings FOR SELECT USING (true);

ALTER TABLE admin_blacklisted_words ENABLE ROW LEVEL SECURITY;
