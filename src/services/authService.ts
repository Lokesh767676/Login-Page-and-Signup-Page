import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: 'farmer' | 'labourer';
  phone?: string;
  location?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  static async signUp(data: SignUpData) {
    try {
      if (!isSupabaseConfigured) {
        // Mock signup for demo
        const mockUser = {
          id: 'demo-' + Date.now(),
          email: data.email,
          user_metadata: {
            full_name: data.fullName,
            role: data.role
          }
        };
        return { user: mockUser, session: null };
      }

      // Real Supabase signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            role: data.role,
            phone: data.phone,
            location: data.location,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Create role-specific record
        if (data.role === 'farmer') {
          await supabase
            .from('farmers')
            .upsert({
              id: authData.user.id,
              experience_years: 0,
              verified: false,
              rating: 0.0,
              total_jobs_posted: 0,
              created_at: new Date().toISOString()
            });
        } else if (data.role === 'labourer') {
          await supabase
            .from('labourers')
            .upsert({
              id: authData.user.id,
              skills: [],
              experience_years: 0,
              availability: true,
              rating: 0.0,
              total_jobs_completed: 0,
              created_at: new Date().toISOString()
            });
        }
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async signIn(data: SignInData) {
    try {
      if (!isSupabaseConfigured) {
        // Mock signin for demo
        const mockUser = {
          id: 'demo-user',
          email: data.email,
          user_metadata: {
            full_name: 'Demo User',
            role: 'farmer'
          }
        };
        return { user: mockUser, session: null };
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      if (!isSupabaseConfigured) {
        return null;
      }
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      if (!isSupabaseConfigured) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      if (!isSupabaseConfigured) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
}