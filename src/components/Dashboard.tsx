import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '@supabase/supabase-js';
import { 
  LogOut, 
  Plus, 
  Briefcase, 
  TrendingUp, 
  Wrench, 
  Activity,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Users,
  Star,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { JobService } from '../services/jobService';
import { CropService } from '../services/cropService';
import { ToolService } from '../services/toolService';
import JobPostingModal from './JobPostingModal';
import JobApplicationModal from './JobApplicationModal';
import LanguageSelector from './LanguageSelector';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('overview');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [jobs, setJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [cropPrices, setCropPrices] = useState<any[]>([]);
  const [smartTools, setSmartTools] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  // Filter states
  const [locationFilter, setLocationFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const userRole = user?.user_metadata?.role || 'farmer';
  const userId = user?.id || 'demo-user';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadJobs(),
        loadMyData(),
        loadCropPrices(),
        loadSmartTools(),
        loadRecentActivity()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const jobsData = await JobService.getJobs({
        location: locationFilter,
        skills: skillsFilter,
        status: 'open'
      });
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadMyData = async () => {
    try {
      if (userRole === 'farmer') {
        const myJobsData = await JobService.getMyJobs(userId);
        setMyJobs(myJobsData);
        
        // Load applications for my jobs
        const allApplications = [];
        for (const job of myJobsData) {
          const jobApplications = await JobService.getJobApplications(job.id);
          allApplications.push(...jobApplications.map(app => ({ ...app, job })));
        }
        setApplications(allApplications);
      } else {
        const myApplicationsData = await JobService.getMyApplications(userId);
        setMyApplications(myApplicationsData);
      }
    } catch (error) {
      console.error('Error loading my data:', error);
    }
  };

  const loadCropPrices = async () => {
    try {
      const prices = await CropService.getPricePredictions();
      setCropPrices(prices);
    } catch (error) {
      console.error('Error loading crop prices:', error);
    }
  };

  const loadSmartTools = async () => {
    try {
      const tools = await ToolService.getFarmingTools();
      setSmartTools(tools);
    } catch (error) {
      console.error('Error loading smart tools:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      if (userRole === 'farmer') {
        // Recent applications for farmer's jobs
        const recentApps = applications
          .filter(app => app.status === 'pending')
          .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
          .slice(0, 5);
        setRecentActivity(recentApps);
      } else {
        // Recent applications by labourer
        const recentApps = myApplications
          .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
          .slice(0, 5);
        setRecentActivity(recentApps);
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleJobPosted = () => {
    loadMyData();
    loadJobs();
    setIsJobModalOpen(false);
  };

  const handleApplicationSent = () => {
    loadMyData();
    setIsApplicationModalOpen(false);
    setSelectedJob(null);
  };

  const handleApplicationAction = async (applicationId: string, action: 'accepted' | 'rejected') => {
    try {
      await JobService.updateApplicationStatus(applicationId, action);
      await loadMyData();
      await loadRecentActivity();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesSkills = skillsFilter.length === 0 || 
      (job.required_skills && job.required_skills.some(skill => 
        skillsFilter.includes(skill)
      ));
    
    return matchesSearch && matchesLocation && matchesSkills;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userRole === 'farmer' ? (
          <>
            <div 
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView('myJobs')}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.jobsPosted')}</p>
                  <p className="text-2xl font-bold text-gray-900">{myJobs.length}</p>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView('prices')}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.priceAlerts')}</p>
                  <p className="text-2xl font-bold text-gray-900">{cropPrices.length}</p>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView('tools')}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Wrench className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.toolsAvailable')}</p>
                  <p className="text-2xl font-bold text-gray-900">{smartTools.length}</p>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView('activity')}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.recentActivity')}</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.filter(app => app.status === 'pending').length}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div 
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView('findJobs')}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.availableJobs')}</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView('myApplications')}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.applicationsSent')}</p>
                  <p className="text-2xl font-bold text-gray-900">{myApplications.length}</p>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView('prices')}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.cropPricePredictions')}</p>
                  <p className="text-2xl font-bold text-gray-900">{cropPrices.length}</p>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView('tools')}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.smartFarmingTools')}</p>
                  <p className="text-2xl font-bold text-gray-900">{smartTools.length}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      {userRole === 'farmer' ? (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">{t('dashboard.readyToHire')}</h3>
              <p className="opacity-90">{t('dashboard.postJobDescription')}</p>
            </div>
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('dashboard.postNewJob')}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">{t('dashboard.lookingForWork')}</h3>
              <p className="opacity-90">{t('dashboard.browseJobsDescription')}</p>
            </div>
            <button
              onClick={() => setActiveView('findJobs')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
            >
              <Search className="h-5 w-5 mr-2" />
              {t('dashboard.findJobs')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMyJobs = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setActiveView('overview')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.backToDashboard')}
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.allJobsPosted')}</h2>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsJobModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('jobs.postJob')}
        </button>
      </div>

      {myJobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.noJobsPosted')}</h3>
          <p className="text-gray-600 mb-4">{t('dashboard.postFirstJob')}</p>
          <button
            onClick={() => setIsJobModalOpen(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            {t('dashboard.postNewJob')}
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {myJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-2">{job.description}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ₹{job.pay_rate}/day
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    job.status === 'open' ? 'bg-green-100 text-green-800' :
                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(`jobs.${job.status}`)}
                  </span>
                  <button
                    onClick={async () => {
                      const jobApplications = await JobService.getJobApplications(job.id);
                      setApplications(jobApplications);
                      setSelectedJob(job);
                      setActiveView('applications');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t('dashboard.viewApplications')}
                  </button>
                </div>
              </div>
              
              {job.required_skills && job.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => setActiveView('myJobs')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {t('jobs.applicationsFor')} "{selectedJob?.title}"
        </h2>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('jobs.noApplications')}</h3>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">
                      {application.labourer?.full_name || 'Applicant'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t(`jobs.${application.status}`)}
                    </span>
                  </div>
                  
                  {application.labourer?.rating && (
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {application.labourer.rating} ({application.labourer.experience_years} years exp.)
                      </span>
                    </div>
                  )}
                  
                  {application.message && (
                    <p className="text-gray-600 mb-3">{application.message}</p>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Applied on {new Date(application.applied_at).toLocaleDateString()}
                  </p>
                </div>
                
                {application.status === 'pending' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApplicationAction(application.id, 'accepted')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('jobs.accept')}
                    </button>
                    <button
                      onClick={() => handleApplicationAction(application.id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t('jobs.reject')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFindJobs = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setActiveView('overview')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.backToDashboard')}
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.availableJobs')}</h2>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('dashboard.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={loadJobs}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('jobs.filterByLocation')}
            </label>
            <input
              type="text"
              placeholder={t('jobs.enterLocation')}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('jobs.requiredSkills')}
            </label>
            <select
              multiple
              value={skillsFilter}
              onChange={(e) => setSkillsFilter(Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Harvesting">{t('jobs.harvesting')}</option>
              <option value="Plowing">{t('jobs.plowing')}</option>
              <option value="Seeding">{t('jobs.seeding')}</option>
              <option value="Weeding">{t('jobs.weeding')}</option>
              <option value="Pesticide Application">{t('jobs.pesticideApplication')}</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setLocationFilter('');
              setSkillsFilter([]);
              setSearchTerm('');
              loadJobs();
            }}
            className="text-green-600 hover:text-green-700"
          >
            {t('jobs.clearFilters')}
          </button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('jobs.noJobsFound')}</h3>
          <p className="text-gray-600">{t('jobs.adjustFilters')}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-3">{job.description}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ₹{job.pay_rate}/day
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {job.start_date ? new Date(job.start_date).toLocaleDateString() : 'Flexible'}
                    </span>
                  </div>
                  
                  {job.farmer && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span className="mr-4">{t('jobs.postedBy')}: {job.farmer.full_name}</span>
                      {job.farmer.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{job.farmer.rating}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.required_skills.map((skill, index) => (
                        <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setIsApplicationModalOpen(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {t('jobs.apply')}
                  </button>
                  
                  {job.contact_number && (
                    <a
                      href={`tel:${job.contact_number}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-center"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {t('jobs.callFarmer')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMyApplications = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setActiveView('overview')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.backToDashboard')}
        </button>
        <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
      </div>
      
      {myApplications.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-4">Start applying for jobs to see your applications here.</p>
          <button
            onClick={() => setActiveView('findJobs')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Find Jobs
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {myApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {application.job?.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{application.job?.description}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {application.job?.location}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ₹{application.job?.pay_rate}/day
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Applied: {new Date(application.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {application.message && (
                    <p className="text-gray-600 mb-3">
                      <strong>Cover Message:</strong> {application.message}
                    </p>
                  )}
                </div>
                
                <div className="ml-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(`jobs.${application.status}`)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCropPrices = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setActiveView('overview')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.backToDashboard')}
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.cropPricePredictions')}</h2>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={loadCropPrices}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('prices.refreshPrices')}
        </button>
      </div>

      {/* Government Daily Prices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('prices.governmentDailyPrices')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { crop: 'Rice (Paddy)', location: 'Andhra Pradesh', price: 2650 + Math.floor(Math.random() * 200), unit: 'quintal', variety: 'Common', change: '+5.2%' },
            { crop: 'Cotton', location: 'Telangana', price: 6200 + Math.floor(Math.random() * 400), unit: 'quintal', variety: 'Medium Staple', change: '+8.1%' },
            { crop: 'Tomato', location: 'Karnataka', price: 2200 + Math.floor(Math.random() * 300), unit: 'quintal', variety: 'Hybrid', change: '-3.5%' },
            { crop: 'Wheat', location: 'Punjab', price: 2100 + Math.floor(Math.random() * 150), unit: 'quintal', variety: 'HD-2967', change: '+2.8%' },
            { crop: 'Onion', location: 'Maharashtra', price: 1500 + Math.floor(Math.random() * 250), unit: 'quintal', variety: 'Red', change: '+12.3%' },
            { crop: 'Sugarcane', location: 'Uttar Pradesh', price: 350 + Math.floor(Math.random() * 50), unit: 'quintal', variety: 'Co-238', change: '+1.5%' },
          ].map((item, index) => (
            <div key={index} className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900">{item.crop}</h4>
              <p className="text-sm text-gray-600">{item.location} • {item.variety}</p>
              <p className="text-2xl font-bold text-green-600">₹{item.price}</p>
              <p className="text-sm text-gray-500">per {item.unit}</p>
              <p className={`text-sm font-medium ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {item.change} from last week
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Price Predictions - Remove empty section and add real data */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('prices.aiPricePredictions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { crop: 'Rice', location: 'Andhra Pradesh', currentPrice: 2650, predictedPrice: 2850, date: '2024-01-15', confidence: 0.87 },
            { crop: 'Cotton', location: 'Telangana', currentPrice: 6200, predictedPrice: 6800, date: '2024-01-15', confidence: 0.82 },
            { crop: 'Tomato', location: 'Karnataka', currentPrice: 2200, predictedPrice: 1950, date: '2024-01-15', confidence: 0.75 },
            { crop: 'Wheat', location: 'Punjab', currentPrice: 2100, predictedPrice: 2250, date: '2024-01-15', confidence: 0.89 },
          ].map((prediction, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{prediction.crop}</h4>
                  <p className="text-sm text-gray-600">{prediction.location}</p>
                  <p className="text-sm text-gray-500">Current: ₹{prediction.currentPrice}</p>
                  <p className="text-2xl font-bold text-blue-600">₹{prediction.predictedPrice}</p>
                  <p className="text-sm text-gray-500">{t('prices.predictedFor')} {prediction.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{t('prices.confidence')}</p>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSmartTools = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setActiveView('overview')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.backToDashboard')}
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.smartFarmingTools')}</h2>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={loadSmartTools}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('tools.refreshTools')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'Smart Drip Irrigation System',
            category: 'Water Management',
            description: 'IoT-enabled automated irrigation system with soil moisture sensors and weather integration for optimal water usage.',
            benefits: ['70% water savings', 'Automated scheduling', 'Mobile monitoring', 'Weather integration'],
            suitable_crops: ['Cotton', 'Tomato', 'Chili', 'Grapes'],
            cost_estimate: 45000,
            usage_count: 156,
            avg_rating: 4.6,
            efficiency: '85%'
          },
          {
            name: 'Soil Health Testing Kit',
            category: 'Soil Analysis',
            description: 'Digital soil testing device that measures pH, NPK levels, moisture, and organic matter content instantly.',
            benefits: ['Instant results', 'Multiple parameters', 'GPS mapping', 'Data logging'],
            suitable_crops: ['All crops'],
            cost_estimate: 8500,
            usage_count: 289,
            avg_rating: 4.4,
            efficiency: '92%'
          },
          {
            name: 'Drone Crop Monitoring',
            category: 'Surveillance',
            description: 'Agricultural drone with multispectral cameras for crop health monitoring, pest detection, and yield estimation.',
            benefits: ['Early pest detection', 'Crop health mapping', 'Yield prediction', 'Time efficient'],
            suitable_crops: ['Rice', 'Wheat', 'Cotton', 'Sugarcane'],
            cost_estimate: 125000,
            usage_count: 78,
            avg_rating: 4.3,
            efficiency: '78%'
          },
          {
            name: 'Weather Monitoring Station',
            category: 'Climate Monitoring',
            description: 'Comprehensive weather station with sensors for temperature, humidity, rainfall, wind speed, and solar radiation.',
            benefits: ['Real-time weather data', 'Forecast alerts', 'Historical data', 'Mobile app'],
            suitable_crops: ['All crops'],
            cost_estimate: 35000,
            usage_count: 203,
            avg_rating: 4.5,
            efficiency: '88%'
          },
          {
            name: 'Precision Seed Planter',
            category: 'Planting Equipment',
            description: 'GPS-guided seed planting machine with variable rate technology for optimal seed placement and spacing.',
            benefits: ['Precise seed placement', 'Reduced seed waste', 'GPS guidance', 'Variable rate seeding'],
            suitable_crops: ['Corn', 'Soybean', 'Cotton', 'Sunflower'],
            cost_estimate: 185000,
            usage_count: 45,
            avg_rating: 4.7,
            efficiency: '91%'
          },
          {
            name: 'Smart Greenhouse Controller',
            category: 'Greenhouse Management',
            description: 'Automated greenhouse control system managing temperature, humidity, ventilation, and irrigation based on crop requirements.',
            benefits: ['Climate control', 'Energy efficient', 'Remote monitoring', 'Automated systems'],
            suitable_crops: ['Vegetables', 'Flowers', 'Herbs', 'Seedlings'],
            cost_estimate: 75000,
            usage_count: 92,
            avg_rating: 4.8,
            efficiency: '94%'
          }
        ].map((tool, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-gray-600 mb-3">{tool.description}</p>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {tool.category}
                </span>
              </div>
              <div className="text-right">
                {tool.avg_rating > 0 && (
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{tool.avg_rating}</span>
                  </div>
                )}
                <p className="text-sm text-gray-500">{tool.usage_count} {t('tools.uses')}</p>
                <p className="text-sm text-green-600 font-medium">{tool.efficiency} efficient</p>
              </div>
            </div>

            {tool.benefits && tool.benefits.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{t('tools.benefits')}:</h4>
                <div className="flex flex-wrap gap-2">
                  {tool.benefits.map((benefit, idx) => (
                    <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tool.suitable_crops && tool.suitable_crops.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{t('tools.suitableFor')}:</h4>
                <div className="flex flex-wrap gap-2">
                  {tool.suitable_crops.map((crop, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-bold text-green-600">₹{tool.cost_estimate.toLocaleString()}</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                {t('dashboard.learnMore')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecentActivity = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setActiveView('overview')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.backToDashboard')}
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.recentActivity')}</h2>
      </div>

      
      {recentActivity.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
          <p className="text-gray-600">Activity will appear here as you interact with the platform.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              {userRole === 'farmer' ? (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {t('dashboard.applicationFrom')} {activity.labourer?.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Job: {activity.job?.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {activity.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApplicationAction(activity.id, 'accepted')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('jobs.accept')}
                      </button>
                      <button
                        onClick={() => handleApplicationAction(activity.id, 'rejected')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {t('jobs.reject')}
                      </button>
                    </div>
                  )}
                  
                  {activity.status !== 'pending' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activity.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t(`jobs.${activity.status}`)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      Application for: {activity.job?.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Farmer: {activity.job?.farmer?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Applied: {new Date(activity.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(`jobs.${activity.status}`)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'myJobs':
        return renderMyJobs();
      case 'applications':
        return renderApplications();
      case 'findJobs':
        return renderFindJobs();
      case 'myApplications':
        return renderMyApplications();
      case 'prices':
        return renderCropPrices();
      case 'tools':
        return renderSmartTools();
      case 'activity':
        return renderRecentActivity();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">🌾</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">AgriConnect</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <span className="text-sm text-gray-600">
                {t('common.welcome')}, {user?.user_metadata?.full_name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-1" />
                {t('dashboard.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveView('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'overview'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('dashboard.overview')}
            </button>
            
            {userRole === 'farmer' ? (
              <>
                <button
                  onClick={() => setActiveView('myJobs')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === 'myJobs'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('dashboard.myJobs')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveView('findJobs')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === 'findJobs'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('dashboard.findJobs')}
                </button>
                <button
                  onClick={() => setActiveView('myApplications')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === 'myApplications'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Applications
                </button>
              </>
            )}
            
            <button
              onClick={() => setActiveView('prices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'prices'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('dashboard.pricePredictions')}
            </button>
            
            <button
              onClick={() => setActiveView('tools')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'tools'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('dashboard.smartTools')}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      <JobPostingModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onJobPosted={handleJobPosted}
        farmerId={userId}
      />

      {selectedJob && (
        <JobApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => {
            setIsApplicationModalOpen(false);
            setSelectedJob(null);
          }}
          onApplicationSent={handleApplicationSent}
          job={selectedJob}
          labourerId={userId}
        />
      )}
    </div>
  );
};

export default Dashboard;