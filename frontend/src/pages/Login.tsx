import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { VintageLayout } from '../components/vintage/VintageLayout';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData);
      navigate('/courses');
    } catch (err) {
      // Error is handled in the store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              {t('auth.welcome_back', 'Welcome Back')}
            </h1>
            <p className="vintage-text text-vintage-muted">
              {t('auth.login_subtitle', 'Sign in to continue your learning journey')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="vintage-input w-full"
                placeholder={t('auth.password_placeholder', 'Enter your password')}
              />
            </div>

            {error && (
              <div className="vintage-alert vintage-alert-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="vintage-button vintage-button-primary w-full"
            >
              {isLoading ? t('auth.logging_in', 'Logging in...') : t('auth.login', 'Login')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="vintage-text text-sm">
              {t('auth.no_account', "Don't have an account?")}{' '}
              <Link to="/register" className="vintage-link">
                {t('auth.register', 'Register')}
              </Link>
            </p>
            <p className="vintage-text text-sm mt-2">
              <Link to="/forgot-password" className="vintage-link">
                {t('auth.forgot_password', 'Forgot password?')}
              </Link>
            </p>
          </div>

          {/* Test credentials hint for development */}
          {import.meta.env.DEV && (
            <div className="mt-8 p-4 bg-vintage-accent bg-opacity-10 rounded-lg">
              <p className="vintage-label text-xs mb-2">Test Credentials:</p>
              <div className="space-y-1 text-xs">
                <p className="font-mono">student@test.com / password123</p>
                <p className="font-mono">teacher@test.com / password123</p>
                <p className="font-mono">admin@test.com / password123</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </VintageLayout>
  );
};