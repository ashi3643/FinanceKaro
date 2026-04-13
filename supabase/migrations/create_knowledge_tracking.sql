-- Create knowledge_interactions table for tracking user learning interactions
CREATE TABLE IF NOT EXISTS knowledge_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL, -- in seconds
  difficulty NUMERIC(3, 2) DEFAULT 0.5,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_knowledge_interactions_device ON knowledge_interactions(device_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_interactions_concept ON knowledge_interactions(concept_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_interactions_timestamp ON knowledge_interactions(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE knowledge_interactions ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for tracking)
CREATE POLICY "Allow public insert on knowledge_interactions"
ON knowledge_interactions FOR INSERT
TO public WITH CHECK (true);

-- Allow service role to read/write
CREATE POLICY "Allow service role all on knowledge_interactions"
ON knowledge_interactions FOR ALL
TO service_role USING (true);

-- Create knowledge_states table for tracking concept mastery
CREATE TABLE IF NOT EXISTS knowledge_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  mastery_level NUMERIC(3, 2) DEFAULT 0.5, -- 0-1 scale
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- total time in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(device_id, concept_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_knowledge_states_device ON knowledge_states(device_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_states_mastery ON knowledge_states(mastery_level);

-- Enable Row Level Security
ALTER TABLE knowledge_states ENABLE ROW LEVEL SECURITY;

-- Allow public insert/update/read
CREATE POLICY "Allow public all on knowledge_states"
ON knowledge_states FOR ALL
TO public USING (true);

-- Allow service role all operations
CREATE POLICY "Allow service role all on knowledge_states"
ON knowledge_states FOR ALL
TO service_role USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_states_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER knowledge_states_updated_at
BEFORE UPDATE ON knowledge_states
FOR EACH ROW
EXECUTE FUNCTION update_knowledge_states_updated_at();
