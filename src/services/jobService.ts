import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { JobPosting, JobApplication, Farmer, Labourer, Profile } from '../lib/supabase';

export interface CreateJobData {
  title: string;
  description: string;
  required_skills: string[];
  location: string;
  pay_rate: number;
  contact_number: string;
  start_date?: string;
}

export interface JobWithFarmer extends JobPosting {
  farmer: Profile & Farmer;
}

export interface ApplicationWithLabourer extends JobApplication {
  labourer: Profile & Labourer;
}

// Mock storage for demo mode
let mockJobs: any[] = [];
let mockApplications: any[] = [];
let jobIdCounter = 1;
let appIdCounter = 1;

export class JobService {
  static async createJob(farmerId: string, jobData: CreateJobData) {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('job_postings')
          .insert({
            farmer_id: farmerId,
            ...jobData,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Mock job creation for demo
        const newJob = {
          id: `job-${jobIdCounter++}`,
          farmer_id: farmerId,
          ...jobData,
          status: 'open',
          created_at: new Date().toISOString(),
        };
        mockJobs.push(newJob);
        return newJob;
      }
    } catch (error) {
      console.error('Create job error:', error);
      throw error;
    }
  }

  static async getJobs(filters?: {
    location?: string;
    skills?: string[];
    status?: string;
  }): Promise<JobWithFarmer[]> {
    try {
      if (isSupabaseConfigured) {
        let query = supabase
          .from('job_postings')
          .select(`
            *,
            farmer:farmers!inner(
              *,
              profile:profiles!inner(*)
            )
          `)
          .order('created_at', { ascending: false });

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        if (filters?.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }

        if (filters?.skills && filters.skills.length > 0) {
          query = query.overlaps('required_skills', filters.skills);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map(job => ({
          ...job,
          farmer: {
            ...job.farmer,
            ...job.farmer.profile,
          }
        }));
      } else {
        // Mock data with filters
        let filteredJobs = [...mockJobs];
        
        if (filters?.status) {
          filteredJobs = filteredJobs.filter(job => job.status === filters.status);
        }
        
        if (filters?.location) {
          filteredJobs = filteredJobs.filter(job => 
            job.location.toLowerCase().includes(filters.location!.toLowerCase())
          );
        }

        return filteredJobs.map(job => ({
          ...job,
          farmer: {
            id: job.farmer_id,
            full_name: 'Demo Farmer',
            rating: 4.5,
            total_jobs_posted: 10
          }
        }));
      }
    } catch (error) {
      console.error('Get jobs error:', error);
      throw error;
    }
  }

  static async applyForJob(jobId: string, labourerId: string, applicationData: {
    message?: string;
    proposed_rate?: number;
  }) {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('job_applications')
          .insert({
            job_id: jobId,
            labourer_id: labourerId,
            message: applicationData.message,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Mock application for demo
        const newApplication = {
          id: `app-${appIdCounter++}`,
          job_id: jobId,
          labourer_id: labourerId,
          message: applicationData.message,
          proposed_rate: applicationData.proposed_rate,
          status: 'pending',
          applied_at: new Date().toISOString(),
        };
        mockApplications.push(newApplication);
        return newApplication;
      }
    } catch (error) {
      console.error('Apply for job error:', error);
      throw error;
    }
  }

  static async getJobApplications(jobId: string): Promise<ApplicationWithLabourer[]> {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('job_applications')
          .select(`
            *,
            labourer:labourers!inner(
              *,
              profile:profiles!inner(*)
            )
          `)
          .eq('job_id', jobId)
          .order('applied_at', { ascending: false });

        if (error) throw error;

        return data.map(application => ({
          ...application,
          labourer: {
            ...application.labourer,
            ...application.labourer.profile,
          }
        }));
      } else {
        // Mock applications
        const jobApplications = mockApplications.filter(app => app.job_id === jobId);
        return jobApplications.map(app => ({
          ...app,
          labourer: {
            id: app.labourer_id,
            full_name: 'Demo Labourer',
            rating: 4.2,
            skills: ['Harvesting', 'Plowing'],
            experience_years: 5
          }
        }));
      }
    } catch (error) {
      console.error('Get job applications error:', error);
      throw error;
    }
  }

  static async updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected') {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('job_applications')
          .update({ status })
          .eq('id', applicationId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Mock update
        const application = mockApplications.find(app => app.id === applicationId);
        if (application) {
          application.status = status;
        }
        return application;
      }
    } catch (error) {
      console.error('Update application status error:', error);
      throw error;
    }
  }

  static async getMyApplications(labourerId: string): Promise<(JobApplication & { job: JobWithFarmer })[]> {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('job_applications')
          .select(`
            *,
            job:job_postings!inner(
              *,
              farmer:farmers!inner(
                *,
                profile:profiles!inner(*)
              )
            )
          `)
          .eq('labourer_id', labourerId)
          .order('applied_at', { ascending: false });

        if (error) throw error;

        return data.map(application => ({
          ...application,
          job: {
            ...application.job,
            farmer: {
              ...application.job.farmer,
              ...application.job.farmer.profile,
            }
          }
        }));
      } else {
        // Mock my applications
        const myApplications = mockApplications.filter(app => app.labourer_id === labourerId);
        return myApplications.map(app => {
          const job = mockJobs.find(j => j.id === app.job_id);
          return {
            ...app,
            job: {
              ...job,
              farmer: {
                id: job?.farmer_id,
                full_name: 'Demo Farmer',
                rating: 4.5
              }
            }
          };
        });
      }
    } catch (error) {
      console.error('Get my applications error:', error);
      throw error;
    }
  }

  static async getMyJobs(farmerId: string): Promise<JobPosting[]> {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('job_postings')
          .select('*')
          .eq('farmer_id', farmerId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        // Mock my jobs
        return mockJobs.filter(job => job.farmer_id === farmerId);
      }
    } catch (error) {
      console.error('Get my jobs error:', error);
      throw error;
    }
  }

  static async updateJobStatus(jobId: string, status: 'open' | 'in_progress' | 'completed' | 'cancelled') {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('job_postings')
          .update({ status })
          .eq('id', jobId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Mock update
        const job = mockJobs.find(j => j.id === jobId);
        if (job) {
          job.status = status;
        }
        return job;
      }
    } catch (error) {
      console.error('Update job status error:', error);
      throw error;
    }
  }

  static async deleteJob(jobId: string, farmerId: string) {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('job_postings')
          .delete()
          .eq('id', jobId)
          .eq('farmer_id', farmerId);

        if (error) throw error;
      } else {
        // Mock delete
        const index = mockJobs.findIndex(job => job.id === jobId && job.farmer_id === farmerId);
        if (index > -1) {
          mockJobs.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('Delete job error:', error);
      throw error;
    }
  }

  // Get mock data for initial load
  static getMockJobs() {
    return mockJobs;
  }

  static getMockApplications() {
    return mockApplications;
  }
}