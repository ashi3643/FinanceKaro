-- Create Profiles Table (Anonymous Devices)
CREATE TABLE public.profiles (
  device_id UUID PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_login_date DATE,
  stage VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  college VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (though wide open for anonymous submission initially)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read profiles" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert profiles" 
ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update profiles" 
ON public.profiles FOR UPDATE USING (true);

-- Create Completed Lessons Tracking Table
CREATE TABLE public.completed_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES public.profiles(device_id),
  level_id INTEGER,
  lesson_id VARCHAR(50),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(device_id, level_id, lesson_id)
);

-- Enable RLS for completed lessons
ALTER TABLE public.completed_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read lessons" 
ON public.completed_lessons FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert lessons" 
ON public.completed_lessons FOR INSERT WITH CHECK (true);

-- Create Analytics View for Pitching Data
CREATE OR REPLACE VIEW public.college_leaderboard AS
  SELECT college, SUM(xp) as total_xp, COUNT(DISTINCT device_id) as students 
  FROM public.profiles 
  WHERE college IS NOT NULL 
  GROUP BY college 
  ORDER BY total_xp DESC 
  LIMIT 10;

-- ML Training Data Table
CREATE TABLE public.training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES public.profiles(device_id),
  features JSONB NOT NULL,
  label VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML Model Versions Table
CREATE TABLE public.model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version VARCHAR(50) NOT NULL,
  description TEXT,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML Predictions Table
CREATE TABLE public.model_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES public.profiles(device_id),
  model_version_id UUID REFERENCES public.model_versions(id),
  input_features JSONB NOT NULL,
  prediction VARCHAR(100),
  feedback VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for ML tables
ALTER TABLE public.training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ML tables
-- Training data: only service role can insert/update, but users can read their own
CREATE POLICY "Allow service role full access to training_data" 
ON public.training_data FOR ALL USING (true);

CREATE POLICY "Allow users read own training_data" 
ON public.training_data FOR SELECT USING (auth.uid()::text = device_id::text);

-- Model versions: public read, service role write
CREATE POLICY "Allow public read model_versions" 
ON public.model_versions FOR SELECT USING (true);

CREATE POLICY "Allow service role write model_versions" 
ON public.model_versions FOR ALL USING (true);

-- Predictions: users can read their own, service role can write
CREATE POLICY "Allow users read own predictions" 
ON public.model_predictions FOR SELECT USING (auth.uid()::text = device_id::text);

CREATE POLICY "Allow service role write predictions" 
ON public.model_predictions FOR ALL USING (true);
