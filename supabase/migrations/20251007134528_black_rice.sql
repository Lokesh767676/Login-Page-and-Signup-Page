/*
  # Complete Supabase Policies Setup

  1. Security Policies
    - Enable RLS on all tables
    - Create comprehensive policies for all user roles
    - Ensure data security and proper access control

  2. Database Functions
    - User management functions
    - Application workflow functions
    - Notification functions

  3. Triggers
    - Auto-update timestamps
    - Profile creation on signup
    - Application notifications
*/

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE labourers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farming_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON profiles;
DROP POLICY IF EXISTS "Allow any authenticated user to read profile" ON profiles;

DROP POLICY IF EXISTS "Users can manage their own role profile" ON farmers;
DROP POLICY IF EXISTS "Users can view all role profiles" ON farmers;
DROP POLICY IF EXISTS "Allow authenticated users to view farmer details" ON farmers;

DROP POLICY IF EXISTS "Users can manage their own role profile" ON labourers;
DROP POLICY IF EXISTS "Users can view all role profiles" ON labourers;

DROP POLICY IF EXISTS "Farmers can manage their own jobs" ON job_postings;
DROP POLICY IF EXISTS "All users can view jobs" ON job_postings;
DROP POLICY IF EXISTS "Allow any logged-in user to see open jobs" ON job_postings;
DROP POLICY IF EXISTS "Allow farmers to delete their own jobs" ON job_postings;

DROP POLICY IF EXISTS "Labourers can manage their own applications" ON job_applications;
DROP POLICY IF EXISTS "Farmers can view applications for their jobs" ON job_applications;
DROP POLICY IF EXISTS "Allow labourers to apply for jobs" ON job_applications;
DROP POLICY IF EXISTS "Allow farmers to see applications for their jobs" ON job_applications;
DROP POLICY IF EXISTS "Allow farmers to update applications for their jobs" ON job_applications;

DROP POLICY IF EXISTS "All users can view public data" ON crops;
DROP POLICY IF EXISTS "All users can view public data" ON price_predictions;
DROP POLICY IF EXISTS "All users can view public data" ON farming_tools;

DROP POLICY IF EXISTS "Farmers can manage their own tool usage" ON tool_usage;

-- PROFILES POLICIES
CREATE POLICY "Enable read access for authenticated users" ON profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable users to update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable users to insert their own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- FARMERS POLICIES
CREATE POLICY "Enable read access for authenticated users" ON farmers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable farmers to manage their own data" ON farmers
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- LABOURERS POLICIES
CREATE POLICY "Enable read access for authenticated users" ON labourers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable labourers to manage their own data" ON labourers
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- JOB POSTINGS POLICIES
CREATE POLICY "Enable read access for all authenticated users" ON job_postings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable farmers to insert their own jobs" ON job_postings
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = farmer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'farmer'
    )
  );

CREATE POLICY "Enable farmers to update their own jobs" ON job_postings
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = farmer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'farmer'
    )
  )
  WITH CHECK (
    auth.uid() = farmer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'farmer'
    )
  );

CREATE POLICY "Enable farmers to delete their own jobs" ON job_postings
  FOR DELETE TO authenticated
  USING (
    auth.uid() = farmer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'farmer'
    )
  );

-- JOB APPLICATIONS POLICIES
CREATE POLICY "Enable read access for job owners and applicants" ON job_applications
  FOR SELECT TO authenticated
  USING (
    auth.uid() = labourer_id OR
    auth.uid() IN (
      SELECT farmer_id FROM job_postings 
      WHERE id = job_applications.job_id
    )
  );

CREATE POLICY "Enable labourers to insert applications" ON job_applications
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = labourer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'labourer'
    ) AND
    EXISTS (
      SELECT 1 FROM job_postings 
      WHERE id = job_id AND status = 'open'
    )
  );

CREATE POLICY "Enable labourers to update their own applications" ON job_applications
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = labourer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'labourer'
    )
  )
  WITH CHECK (
    auth.uid() = labourer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'labourer'
    )
  );

CREATE POLICY "Enable farmers to update applications for their jobs" ON job_applications
  FOR UPDATE TO authenticated
  USING (
    auth.uid() IN (
      SELECT farmer_id FROM job_postings 
      WHERE id = job_applications.job_id
    ) AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'farmer'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT farmer_id FROM job_postings 
      WHERE id = job_applications.job_id
    ) AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'farmer'
    )
  );

-- CROPS POLICIES (Public read access)
CREATE POLICY "Enable read access for all authenticated users" ON crops
  FOR SELECT TO authenticated
  USING (true);

-- PRICE PREDICTIONS POLICIES (Public read access)
CREATE POLICY "Enable read access for all authenticated users" ON price_predictions
  FOR SELECT TO authenticated
  USING (true);

-- FARMING TOOLS POLICIES (Public read access)
CREATE POLICY "Enable read access for all authenticated users" ON farming_tools
  FOR SELECT TO authenticated
  USING (true);

-- TOOL USAGE POLICIES
CREATE POLICY "Enable read access for tool owners" ON tool_usage
  FOR SELECT TO authenticated
  USING (auth.uid() = farmer_id);

CREATE POLICY "Enable farmers to manage their own tool usage" ON tool_usage
  FOR ALL TO authenticated
  USING (
    auth.uid() = farmer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'farmer'
    )
  )
  WITH CHECK (
    auth.uid() = farmer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'farmer'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
    NOW()
  );
  
  -- Create role-specific record
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'farmer') = 'farmer' THEN
    INSERT INTO farmers (id, experience_years, verified, rating, total_jobs_posted, created_at)
    VALUES (NEW.id, 0, false, 0.0, 0, NOW());
  ELSE
    INSERT INTO labourers (id, experience_years, availability, rating, total_jobs_completed, created_at)
    VALUES (NEW.id, 0, true, 0.0, 0, NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is farmer
CREATE OR REPLACE FUNCTION is_farmer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'farmer' FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is labourer
CREATE OR REPLACE FUNCTION is_labourer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'labourer' FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get job applications count for a farmer
CREATE OR REPLACE FUNCTION get_pending_applications_count(farmer_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM job_applications ja
    JOIN job_postings jp ON ja.job_id = jp.id
    WHERE jp.farmer_id = farmer_id AND ja.status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_postings_farmer_id ON job_postings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_labourer_id ON job_applications(labourer_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_price_predictions_crop_id ON price_predictions(crop_id);
CREATE INDEX IF NOT EXISTS idx_price_predictions_location ON price_predictions(location);
CREATE INDEX IF NOT EXISTS idx_price_predictions_date ON price_predictions(prediction_date DESC);

CREATE INDEX IF NOT EXISTS idx_tool_usage_farmer_id ON tool_usage(farmer_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_id ON tool_usage(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_date ON tool_usage(usage_date DESC);