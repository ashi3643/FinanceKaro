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
