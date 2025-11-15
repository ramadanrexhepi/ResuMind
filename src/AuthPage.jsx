import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineCheck } from 'react-icons/hi';
import { useAuth } from './AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.target);
    const email = (formData.get('email') || '').toString().trim();
    const password = (formData.get('password') || '').toString();
    const name = (formData.get('name') || '').toString().trim();

    try {
      let result;
      
      if (isLogin) {
        // Login
        result = await login(email, password);
      } else {
        // Signup
        result = await signup(name, email, password);
      }

      if (result.success) {
        console.log('Authentication successful:', result.user);
        
        // Clear old user data first to ensure fresh data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userPlan');
        
        // Store new user data and token in localStorage
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
          
          // Store plan information for BillingPage
          if (result.user.plan) {
            const planData = {
              plan: result.user.plan.type || 'free',
              billingInfo: result.user.plan.paymentId ? {
                purchasedDate: result.user.plan.startDate,
                paymentMethod: 'Credit Card •••• •••• •••• 1234', // This would come from payment processor
                transactionId: result.user.plan.paymentId,
                paymentHistory: result.user.plan.paymentId ? [{
                  date: result.user.plan.startDate,
                  amount: result.user.plan.type === 'pro' ? '9.00' : '0.00',
                  description: result.user.plan.type === 'pro' ? 'Pro Optimization - One-time payment' : 'Free Plan'
                }] : []
              } : null
            };
            localStorage.setItem('userPlan', JSON.stringify(planData));
          }
        }
        if (result.token) {
          localStorage.setItem('token', result.token);
        }
        
        // Navigate after successful auth
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="brand-content">
            <h1>ResuMind</h1>
            <p>Optimize your resume with AI in seconds</p>
            <div className="brand-features">
              <div className="brand-feature">
                <span className="feature-check">✓</span>
                <span>AI-powered analysis</span>
              </div>
              <div className="brand-feature">
                <span className="feature-check">✓</span>
                <span>ATS optimization</span>
              </div>
              <div className="brand-feature">
                <span className="feature-check">✓</span>
                <span>Professional templates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            {/* Toggle Buttons */}
            <div className="auth-toggle">
              <button
                className={isLogin ? 'active' : ''}
                disabled={isLoading}
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Log In
              </button>
              <button
                className={!isLogin ? 'active' : ''}
                disabled={isLoading}
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Form Title */}
            <h2 className="form-title">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </h2>
            <p className="form-subtitle">
              {isLogin 
                ? 'Log in to continue optimizing your resume' 
                : 'Sign up to get started with AI resume optimization'}
            </p>

            {/* Error Message */}
            {error && (
              <div className="error-message" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Name Field (Sign Up Only) */}
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    {/*<HiOutlineUser className="input-icon" />  */}
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="First & Last Name"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                 {/* <HiOutlineMail className="input-icon" />  */}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                {/* <HiOutlineLockClosed className="input-icon" /> */}
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {/* Forgot Password (Login Only) */}
              {isLogin && (
                <div className="form-options">
                  <a href="#" className="forgot-link" onClick={(e)=> e.preventDefault()}>
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Terms (Sign Up Only) */}
              {!isLogin && (
                <div className="form-group checkbox-group">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms">
                    I agree to the <a href="/terms">Terms of Service</a> and{' '}
                    <a href="/privacy">Privacy Policy</a>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? 'Please wait...' : (isLogin ? 'Log In' : 'Create Account')}
              </button>

              {/* Divider */}
              <div className="divider">
                <span>or</span>
              </div>

              {/* Social Login Buttons */}
              <button type="button" className="btn-social google">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
                Continue with Google
              </button>

              <button type="button" className="btn-social github">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                Continue with GitHub
              </button>
            </form>

            {/* Footer Link */}
            <p className="auth-footer">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="switch-link"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
