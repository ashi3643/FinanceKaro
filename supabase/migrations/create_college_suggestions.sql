-- Create college_suggestions table
CREATE TABLE IF NOT EXISTS college_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_college_suggestions_name ON college_suggestions(name);
CREATE INDEX IF NOT EXISTS idx_college_suggestions_count ON college_suggestions(count DESC);

-- Enable Row Level Security
ALTER TABLE college_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for suggestions)
CREATE POLICY "Allow public read access on college_suggestions" 
ON college_suggestions FOR SELECT 
TO public USING (true);

-- Allow service role to insert/update
CREATE POLICY "Allow service role insert on college_suggestions" 
ON college_suggestions FOR INSERT 
TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role update on college_suggestions" 
ON college_suggestions FOR UPDATE 
TO service_role WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_college_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER college_suggestions_updated_at
BEFORE UPDATE ON college_suggestions
FOR EACH ROW
EXECUTE FUNCTION update_college_suggestions_updated_at();

-- Seed initial colleges (Tier 1, 2, 3 colleges across India)
INSERT INTO college_suggestions (name, count) VALUES
  -- IITs (Tier 1)
  ('IIT Delhi, Delhi', 1),
  ('IIT Bombay, Mumbai', 1),
  ('IIT Madras, Chennai', 1),
  ('IIT Kanpur, Kanpur', 1),
  ('IIT Kharagpur, Kharagpur', 1),
  ('IIT Roorkee, Roorkee', 1),
  ('IIT Guwahati, Guwahati', 1),
  ('IIT Hyderabad, Hyderabad', 1),
  ('IIT Indore, Indore', 1),
  ('IIT Bhubaneswar, Bhubaneswar', 1),
  ('IIT Gandhinagar, Gandhinagar', 1),
  ('IIT Ropar, Rupnagar', 1),
  ('IIT Patna, Patna', 1),
  ('IIT Bhilai, Bhilai', 1),
  ('IIT Goa, Goa', 1),
  ('IIT Jammu, Jammu', 1),
  ('IIT Dharwad, Dharwad', 1),
  ('IIT Tirupati, Tirupati', 1),
  ('IIT Palakkad, Palakkad', 1),
  ('IIT Mandi, Mandi', 1),
  ('IIT Jodhpur, Jodhpur', 1),
  ('IIT Dhanbad, Dhanbad', 1),
  ('IIT BHU, Varanasi', 1),
  
  -- BITS (Tier 1)
  ('BITS Pilani, Pilani', 1),
  ('BITS Goa, Goa', 1),
  ('BITS Hyderabad, Hyderabad', 1),
  
  -- NITs (Tier 1/2)
  ('NIT Trichy, Tiruchirappalli', 1),
  ('NIT Surathkal, Mangalore', 1),
  ('NIT Warangal, Warangal', 1),
  ('NIT Calicut, Kozhikode', 1),
  ('NIT Kurukshetra, Kurukshetra', 1),
  ('NIT Allahabad, Prayagraj', 1),
  ('NIT Jamshedpur, Jamshedpur', 1),
  ('NIT Durgapur, Durgapur', 1),
  ('NIT Silchar, Silchar', 1),
  ('NIT Srinagar, Srinagar', 1),
  ('NIT Nagpur, Nagpur', 1),
  ('NIT Rourkela, Rourkela', 1),
  ('NIT Jaipur, Jaipur', 1),
  ('NIT Hamirpur, Hamirpur', 1),
  ('NIT Jalandhar, Jalandhar', 1),
  ('NIT Patna, Patna', 1),
  ('NIT Raipur, Raipur', 1),
  ('NIT Agartala, Agartala', 1),
  ('NIT Delhi, Delhi', 1),
  ('NIT Puducherry, Puducherry', 1),
  ('NIT Goa, Goa', 1),
  ('NIT Meghalaya, Shillong', 1),
  ('NIT Manipur, Imphal', 1),
  ('NIT Mizoram, Aizawl', 1),
  ('NIT Nagaland, Dimapur', 1),
  ('NIT Sikkim, Ravangla', 1),
  ('NIT Andhra Pradesh, Tadepalligudem', 1),
  ('NIT Uttarakhand, Srinagar', 1),
  ('NIT Arunachal Pradesh, Jote', 1),
  ('NIT Karnataka, Surathkal', 1),
  
  -- IIITs (Tier 1/2)
  ('IIIT Hyderabad, Hyderabad', 1),
  ('IIIT Bangalore, Bangalore', 1),
  ('IIIT Delhi, Delhi', 1),
  ('IIIT Allahabad, Prayagraj', 1),
  ('IIIT Kottayam, Kottayam', 1),
  ('IIIT Sri City, Sri City', 1),
  ('IIIT Gwalior, Gwalior', 1),
  ('IIIT Jabalpur, Jabalpur', 1),
  ('IIITDM Kancheepuram, Kancheepuram', 1),
  ('IIITDM Jabalpur, Jabalpur', 1),
  ('IIIT Bhopal, Bhopal', 1),
  ('IIIT Pune, Pune', 1),
  ('IIIT Ranchi, Ranchi', 1),
  ('IIIT Vadodara, Vadodara', 1),
  ('IIIT Dharwad, Dharwad', 1),
  ('IIIT Bhagalpur, Bhagalpur', 1),
  ('IIIT Lucknow, Lucknow', 1),
  ('IIIT Kalyani, Kalyani', 1),
  ('IIIT Agartala, Agartala', 1),
  ('IIIT Una, Una', 1),
  ('IIIT Surat, Surat', 1),
  ('IIIT Bhubaneswar, Bhubaneswar', 1),
  ('IIIT Guwahati, Guwahati', 1),
  
  -- Central Universities (Tier 1/2)
  ('Delhi University, Delhi', 1),
  ('JNU, Delhi', 1),
  ('Banaras Hindu University, Varanasi', 1),
  ('Aligarh Muslim University, Aligarh', 1),
  ('Panjab University, Chandigarh', 1),
  ('University of Hyderabad, Hyderabad', 1),
  ('Jadavpur University, Kolkata', 1),
  ('University of Calcutta, Kolkata', 1),
  ('University of Mumbai, Mumbai', 1),
  ('University of Pune, Pune', 1),
  ('Savitribai Phule Pune University, Pune', 1),
  ('Anna University, Chennai', 1),
  ('Osmania University, Hyderabad', 1),
  ('University of Madras, Chennai', 1),
  ('University of Mysore, Mysore', 1),
  ('University of Kerala, Thiruvananthapuram', 1),
  ('University of Bangalore, Bangalore', 1),
  ('University of Gujarat, Ahmedabad', 1),
  ('University of Rajasthan, Jaipur', 1),
  ('University of Lucknow, Lucknow', 1),
  ('University of Patna, Patna', 1),
  ('University of Allahabad, Prayagraj', 1),
  ('University of Kashmir, Srinagar', 1),
  ('University of Jammu, Jammu', 1),
  ('University of Himachal Pradesh, Shimla', 1),
  ('University of Uttarakhand, Dehradun', 1),
  ('University of North Bengal, Siliguri', 1),
  ('University of Burdwan, Burdwan', 1),
  ('University of Kalyani, Kalyani', 1),
  ('Tezpur University, Tezpur', 1),
  ('Assam University, Silchar', 1),
  ('Dibrugarh University, Dibrugarh', 1),
  ('Gauhati University, Guwahati', 1),
  ('Manipur University, Imphal', 1),
  ('Mizoram University, Aizawl', 1),
  ('Nagaland University, Lumami', 1),
  ('Tripura University, Agartala', 1),
  ('Sikkim University, Gangtok', 1),
  ('Jawaharlal Nehru University, Delhi', 1),
  
  -- State Universities (Tier 2/3) - Major ones
  ('Andhra University, Visakhapatnam', 1),
  ('Acharya Nagarjuna University, Guntur', 1),
  ('Sri Venkateswara University, Tirupati', 1),
  ('Kakatiya University, Warangal', 1),
  ('Telangana University, Nizamabad', 1),
  ('Mahatma Gandhi University, Kottayam', 1),
  ('Cochin University of Science and Technology, Kochi', 1),
  ('University of Calicut, Kozhikode', 1),
  ('Kannur University, Kannur', 1),
  ('Sree Sankaracharya University of Sanskrit, Kalady', 1),
  
  -- Deemed Universities (Tier 1/2/3)
  ('SRM University, Chennai', 1),
  ('VIT University, Vellore', 1),
  ('Amrita Vishwa Vidyapeetham, Coimbatore', 1),
  ('Manipal University, Manipal', 1),
  ('SASTRA University, Thanjavur', 1),
  ('Bharath University, Chennai', 1),
  ('Sathyabama Institute of Science and Technology, Chennai', 1),
  ('Vellore Institute of Technology, Vellore', 1),
  ('SRM Institute of Science and Technology, Chennai', 1),
  ('Amrita School of Engineering, Coimbatore', 1),
  ('Manipal Institute of Technology, Manipal', 1),
  
  -- Medical Colleges (Tier 1/2)
  ('AIIMS Delhi, Delhi', 1),
  ('AIIMS Mumbai, Mumbai', 1),
  ('AIIMS Chennai, Chennai', 1),
  ('AIIMS Kolkata, Kolkata', 1),
  ('AIIMS Bhubaneswar, Bhubaneswar', 1),
  ('AIIMS Jodhpur, Jodhpur', 1),
  ('AIIMS Bhopal, Bhopal', 1),
  ('AIIMS Rishikesh, Rishikesh', 1),
  ('AIIMS Patna, Patna', 1),
  ('AIIMS Raipur, Raipur', 1),
  ('AIIMS Rourkela, Rourkela', 1),
  ('JIPMER, Puducherry', 1),
  ('PGIMER, Chandigarh', 1),
  ('CMC Vellore, Vellore', 1),
  ('AFMC Pune, Pune', 1),
  ('Christian Medical College, Vellore', 1),
  ('St. John''s Medical College, Bangalore', 1),
  ('Kasturba Medical College, Manipal', 1),
  ('Madras Medical College, Chennai', 1),
  ('Grant Medical College, Mumbai', 1),
  ('King George''s Medical University, Lucknow', 1),
  ('Government Medical College, Thiruvananthapuram', 1),
  
  -- Law Colleges (Tier 1/2)
  ('National Law School of India University, Bangalore', 1),
  ('NALSAR University of Law, Hyderabad', 1),
  ('National Law University, Delhi', 1),
  ('WB National University of Juridical Sciences, Kolkata', 1),
  ('National Law Institute University, Bhopal', 1),
  ('Gujarat National Law University, Gandhinagar', 1),
  ('Dr. Ram Manohar Lohiya National Law University, Lucknow', 1),
  ('Rajiv Gandhi National University of Law, Patiala', 1),
  ('National Law University, Jodhpur', 1),
  ('Chanakya National Law University, Patna', 1)
ON CONFLICT (name) DO NOTHING;
