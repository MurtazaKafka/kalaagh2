import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { VintageLayout } from '../components/vintage/VintageLayout';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'student' as 'student' | 'teacher' | 'parent',
    preferred_language: i18n.language as 'en' | 'fa' | 'ps',
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError(t('auth.passwords_mismatch', 'Passwords do not match'));
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setValidationError(t('auth.password_too_short', 'Password must be at least 6 characters'));
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/courses');
    } catch (err) {
      // Error is handled in the store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <VintageLayout hideNavigation>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="vintage-card max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="vintage-headline text-3xl mb-2">
              {t('auth.create_account', 'Create Account')}
            </h1>
            <p className="vintage-text text-vintage-muted">
              {t('auth.register_subtitle', 'Join our educational community')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="vintage-label">
                  {t('auth.first_name', 'First Name')}
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="vintage-input w-full"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="vintage-label">
                  {t('auth.last_name', 'Last Name')}
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="vintage-input w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="vintage-label">
                {t('auth.email', 'Email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="vintage-input w-full"
                placeholder={t('auth.email_placeholder', 'your.email@example.com')}
              />
            </div>

            <div>
              <label htmlFor="role" className="vintage-label">
                {t('auth.i_am_a', 'I am a')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="vintage-select w-full"
              >
                <option value="student">{t('auth.student', 'Student')}</option>
                <option value="teacher">{t('auth.teacher', 'Teacher')}</option>
                <option value="parent">{t('auth.parent', 'Parent')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="vintage-label">
                {t('auth.password', 'Password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="vintage-input w-full"
                placeholder={t('auth.password_hint', 'At least 6 characters')}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="vintage-label">
                {t('auth.confirm_password', 'Confirm Password')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="vintage-input w-full"
                placeholder={t('auth.confirm_password_placeholder', 'Re-enter your password')}
              />
            </div>

            {(error || validationError) && (
              <div className="vintage-alert vintage-alert-error">
                {error || validationError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="vintage-button vintage-button-primary w-full"
            >
              {isLoading ? t('auth.creating_account', 'Creating account...') : t('auth.register', 'Register')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="vintage-text text-sm">
              {t('auth.have_account', 'Already have an account?')}{' '}
              <Link to="/login" className="vintage-link">
                {t('auth.login', 'Login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </VintageLayout>
  );
};