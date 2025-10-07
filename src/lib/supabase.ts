import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using demo mode.');
}

// Use demo values if environment variables are not set
const defaultUrl = supabaseUrl || 'https://demo.supabase.co';
const defaultKey = supabaseAnonKey || 'demo-key';

export const supabase = createClient(defaultUrl, defaultKey);

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'farmer' | 'labourer';
  location?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Farmer {
  id: string;
  farm_size?: number;
  farm_location?: string;
  primary_crops?: string[];
  experience_years: number;
  verified: boolean;
  rating: number;
  total_jobs_posted: number;
  created_at: string;
}

export interface Labourer {
  id: string;
  skills?: string[];
  experience_years: number;
  hourly_rate?: number;
  availability: boolean;
  rating: number;
  total_jobs_completed: number;
  created_at: string;
}

export interface JobPosting {
  id: string;
  farmer_id: string;
  title: string;
  description: string;
  required_skills?: string[];
  location: string;
  pay_rate: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  start_date?: string;
  created_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  labourer_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
}

export interface Crop {
  id: string;
  name: string;
  category: 'cereals' | 'pulses' | 'vegetables' | 'fruits' | 'spices' | 'cash_crops';
  created_at: string;
}

export interface PricePrediction {
  id: string;
  crop_id: string;
  location: string;
  predicted_price: number;
  prediction_date: string;
  confidence_score: number;
  created_at: string;
}

export interface FarmingTool {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits?: string[];
  suitable_crops?: string[];
  created_at: string;
}

export interface ToolUsage {
  id: string;
  farmer_id: string;
  tool_id: string;
  usage_date: string;
  notes?: string;
  created_at: string;
}