-- Add Ghost Engine Flags
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_ghost BOOLEAN DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT false;

-- Check if community_comments table exists, if not, wait I should just add it to community_comments if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_comments') THEN
        ALTER TABLE community_comments ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT false;
    END IF;
END $$;
