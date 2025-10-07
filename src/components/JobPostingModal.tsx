import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Calendar, DollarSign, Clock, Phone } from 'lucide-react';
import { JobService } from '../services/jobService';

export interface CreateJobData {
  title: string;
  description: string;
  required_skills: string[];
  location: string;
  pay_rate: number;
  contact_number: string;
  start_date?: string;
}

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobPosted: () => void;
  farmerId: string;
}

const JobPostingModal: React.FC<JobPostingModalProps> = ({
  isOpen,
  onClose,
  onJobPosted,
  farmerId
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobData, setJobData] = useState<CreateJobData>({
    title: '',
    description: '',
    required_skills: [],
    location: '',
    pay_rate: 500,
    contact_number: '',
    start_date: ''
  });

  const skillOptions = [
    'Plowing', 'Seeding', 'Harvesting', 'Irrigation', 'Pesticide Application',
    'Fertilizer Application', 'Weeding', 'Pruning', 'Crop Monitoring',
    'Equipment Operation', 'Livestock Care', 'Organic Farming'
  ];

  const handleSkillToggle = (skill: string) => {
    setJobData(prev => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter(s => s !== skill)
        : [...prev.required_skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobData.title || !jobData.description || !jobData.location || !jobData.pay_rate || !jobData.contact_number) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await JobService.createJob(farmerId, jobData);
      onJobPosted();
      setJobData({
        title: '',
        description: '',
        required_skills: [],
        location: '',
        pay_rate: 500,
        contact_number: '',
        start_date: ''
      });
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{t('jobs.postJob')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('jobs.title')} *
            </label>
            <input
              type="text"
              required
              value={jobData.title}
              onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Rice Harvesting Workers Needed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('jobs.description')} *
            </label>
            <textarea
              required
              rows={4}
              value={jobData.description}
              onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe the work requirements, conditions, and expectations..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                {t('jobs.location')} *
              </label>
              <input
                type="text"
                required
                value={jobData.location}
                onChange={(e) => setJobData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Village, District, State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                {t('jobs.payRate')} *
              </label>
              <input
                type="number"
                required
                min="100"
                value={jobData.pay_rate}
                onChange={(e) => setJobData(prev => ({ ...prev, pay_rate: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              {t('jobs.contactNumber')} *
            </label>
            <input
              type="tel"
              required
              value={jobData.contact_number}
              onChange={(e) => setJobData(prev => ({ ...prev, contact_number: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              {t('jobs.startDate')}
            </label>
            <input
              type="date"
              value={jobData.start_date}
              onChange={(e) => setJobData(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('jobs.requiredSkills')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {skillOptions.map(skill => (
                <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jobData.required_skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('jobs.postJob')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingModal;