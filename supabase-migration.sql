-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Confessions table
CREATE TABLE IF NOT EXISTS confessions (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'border-zinc-800 hover:border-zinc-700',
  likes INTEGER DEFAULT 0,
  skull INTEGER DEFAULT 0,
  fire INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  confession_id BIGINT NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_comments_confession_id ON comments(confession_id);

-- Enable Row Level Security (allow public read/write for anonymous app)
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies: allow anyone to read and insert
CREATE POLICY "Allow public read confessions" ON confessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert confessions" ON confessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update confessions" ON confessions FOR UPDATE USING (true);

CREATE POLICY "Allow public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert comments" ON comments FOR INSERT WITH CHECK (true);

-- Enable Realtime
alter publication supabase_realtime add table confessions;
alter publication supabase_realtime add table comments;

-- Reactions tracking table (for Device-based limiting)
CREATE TABLE IF NOT EXISTS confession_reactions (
  id BIGSERIAL PRIMARY KEY,
  confession_id BIGINT NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(confession_id, device_id)
);

-- Enable RLS for reactions
ALTER TABLE confession_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read reactions" ON confession_reactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert reactions" ON confession_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update reactions" ON confession_reactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete reactions" ON confession_reactions FOR DELETE USING (true);
