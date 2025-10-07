import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '@supabase/supabase-js';
import { AuthService } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '' as 'farmer' | 'labourer' | '',
    phone: '',
    location: ''
  });

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const { user } = await AuthService.signIn(loginData);
      if (user) {
        onLoginSuccess(user);
        setLoginData({ email: '', password: '' });
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!signupData.fullName || !signupData.email || !signupData.password || !signupData.role) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const { user } = await AuthService.signUp(signupData);
      if (user) {
        onLoginSuccess(user);
        setSignupData({ fullName: '', email: '', password: '', role: '', phone: '', location: '' });
      }
    } catch (error: any) {
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = () => {
    setIsSignup(true);
    setError('');
    setLoginData({ email: '', password: '' });
  };

  const switchToLogin = () => {
    setIsSignup(false);
    setError('');
    setSignupData({ fullName: '', email: '', password: '', role: '', phone: '', location: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={handleModalClick}>
      <div className="modal-content">
        <div className="modal-info-panel">
          <div className="modal-logo">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">🌾</span>
            </div>
            <div className="modal-logo-text">AgriConnect</div>
          </div>

          <h1>{t('auth.welcome')}</h1>
          <p>{t('auth.welcomeDescription')}</p>
        </div>

        <div className="modal-form-container">
          <span className="close" onClick={onClose}>&times;</span>
          
          {!isSignup ? (
            <form id="login-form" onSubmit={handleLogin}>
              <h2>{t('auth.signIn')}</h2>
              {error && (
                <div style={{ color: '#dc3545', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}
              <div className="form-group">
                <label>{t('auth.email')}</label>
                <input 
                  type="email" 
                  placeholder={t('auth.email')}
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('auth.password')}</label>
                <input 
                  type="password" 
                  placeholder={t('auth.password')}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required 
                />
              </div>
              <button type="submit" className="modal-btn" disabled={loading}>
                {loading ? t('auth.signingIn') : t('auth.login')}
              </button>
              <div className="toggle-link" onClick={switchToSignup}>
                {t('auth.noAccount')}
              </div>
            </form>
          ) : (
            <form id="signup-form" onSubmit={handleSignup}>
              <h2>{t('auth.signUp')}</h2>
              {error && (
                <div style={{ color: '#dc3545', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}
              <div className="form-group">
                <label>{t('auth.fullName')}</label>
                <input 
                  type="text" 
                  placeholder={t('auth.fullName')}
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('auth.email')}</label>
                <input 
                  type="email" 
                  placeholder={t('auth.email')}
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('auth.password')}</label>
                <input 
                  type="password" 
                  placeholder={t('auth.password')}
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('auth.phone')}</label>
                <input 
                  type="tel" 
                  placeholder={t('auth.phone')}
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t('auth.location')}</label>
                <input 
                  type="text" 
                  placeholder={t('auth.location')}
                  value={signupData.location}
                  onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t('auth.accountType')}</label>
                <select 
                  value={signupData.role}
                  onChange={(e) => setSignupData({ ...signupData, role: e.target.value as 'farmer' | 'labourer' })}
                  required
                >
                  <option value="">{t('auth.accountType')}</option>
                  <option value="farmer">{t('auth.farmer')}</option>
                  <option value="labourer">{t('auth.labourer')}</option>
                </select>
              </div>
              <button type="submit" className="modal-btn" disabled={loading}>
                {loading ? t('auth.creatingAccount') : t('auth.signup')}
              </button>
              <div className="toggle-link" onClick={switchToLogin}>
                {t('auth.hasAccount')}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;