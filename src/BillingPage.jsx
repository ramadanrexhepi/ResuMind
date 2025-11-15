import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './BillingPage.css';
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineDownload
} from 'react-icons/hi';

export default function BillingPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState('free'); // 'free' or 'pro'
  const [billingInfo, setBillingInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }

    // Get plan info from localStorage (or default to free)
    const planData = localStorage.getItem('userPlan');
    if (planData) {
      const parsedPlan = JSON.parse(planData);
      setPlan(parsedPlan.plan || 'free');
      setBillingInfo(parsedPlan.billingInfo || null);
    }

    setLoading(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Close sidebar on Escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };

    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, closeSidebar]);

  const handleNavClick = (path) => {
    navigate(path);
    closeSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/auth');
    closeSidebar();
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="billing-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-page">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar Navigation */}
      <nav className={`sidebar-nav ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>ResuMind</h2>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <HiOutlineX />
          </button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || 'User'}</p>
            <p className="sidebar-user-email">{user?.email || ''}</p>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li>
            <button 
              className="sidebar-menu-item"
              onClick={() => handleNavClick('/dashboard')}
            >
              <HiOutlineHome />
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button 
              className="sidebar-menu-item"
              onClick={() => handleNavClick('/upload')}
            >
              <HiOutlineDownload />
              <span>Upload Resume</span>
            </button>
          </li>
          <li>
            <button 
              className="sidebar-menu-item"
              onClick={() => handleNavClick('/generator')}
            >
              <HiOutlineSparkles />
              <span>Generate Resume</span>
            </button>
          </li>
          <li>
            <button 
              className="sidebar-menu-item active"
              onClick={() => handleNavClick('/billing')}
            >
              <HiOutlineCreditCard />
              <span>Billing</span>
            </button>
          </li>
          <li>
            <button 
              className="sidebar-menu-item"
              onClick={() => handleNavClick('/settings')}
            >
              <HiOutlineCog />
              <span>Settings</span>
            </button>
          </li>
          <li className="sidebar-divider"></li>
          <li>
            <button 
              className="sidebar-menu-item sidebar-menu-item-danger"
              onClick={handleLogout}
            >
              <HiOutlineLogout />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="billing-container">
        {/* Hamburger Menu Button */}
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <HiOutlineMenu />
        </button>

        {/* Header */}
        <div className="billing-header">
          <h1>Billing & Plans</h1>
          <p className="billing-subtitle">Manage your subscription and billing information</p>
        </div>

        {/* Current Plan Card */}
        <div className="plan-card">
          <div className="plan-card-header">
            <div>
              <h2>Current Plan</h2>
              <p className="plan-status">
                {plan === 'pro' ? (
                  <span className="status-badge pro">Pro Plan Active</span>
                ) : (
                  <span className="status-badge free">Free Plan</span>
                )}
              </p>
            </div>
            {plan === 'pro' && (
              <HiOutlineShieldCheck className="plan-icon pro" />
            )}
          </div>

          <div className="plan-details">
            {plan === 'pro' ? (
              <>
                <div className="plan-info-row">
                  <span className="info-label">Plan Name:</span>
                  <span className="info-value">Pro Optimization</span>
                </div>
                <div className="plan-info-row">
                  <span className="info-label">Price:</span>
                  <span className="info-value">$9.00 (one-time payment)</span>
                </div>
                {billingInfo?.purchasedDate && (
                  <div className="plan-info-row">
                    <span className="info-label">Purchased:</span>
                    <span className="info-value">{formatDate(billingInfo.purchasedDate)}</span>
                  </div>
                )}
                <div className="plan-features-list">
                  <h3>Plan Features:</h3>
                  <ul>
                    <li><HiOutlineCheckCircle /> Full AI rewrite</li>
                    <li><HiOutlineCheckCircle /> ATS formatting</li>
                    <li><HiOutlineCheckCircle /> Downloadable PDF</li>
                    <li><HiOutlineCheckCircle /> Professional templates</li>
                    <li><HiOutlineCheckCircle /> Unlimited revisions</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="plan-info-row">
                  <span className="info-label">Plan Name:</span>
                  <span className="info-value">Free Scan</span>
                </div>
                <div className="plan-info-row">
                  <span className="info-label">Price:</span>
                  <span className="info-value">$0.00</span>
                </div>
                <div className="plan-features-list">
                  <h3>Current Features:</h3>
                  <ul>
                    <li><HiOutlineCheckCircle /> AI review of your resume</li>
                    <li><HiOutlineCheckCircle /> Keyword match score</li>
                    <li><HiOutlineCheckCircle /> Basic improvement tips</li>
                  </ul>
                </div>
                <div className="upgrade-section">
                  <h3>Upgrade to Pro</h3>
                  <p>Unlock all features with our Pro Optimization plan</p>
                  <button className="btn-upgrade" onClick={handleUpgrade}>
                    <HiOutlineSparkles />
                    Upgrade to Pro
                    <HiOutlineArrowRight />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Billing Information (Pro Plan Only) */}
        {plan === 'pro' && billingInfo && (
          <div className="billing-info-card">
            <h2>Billing Information</h2>
            <div className="billing-details">
              <div className="billing-detail-row">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">
                  {billingInfo.paymentMethod || 'Credit Card •••• •••• •••• 1234'}
                </span>
              </div>
              <div className="billing-detail-row">
                <span className="detail-label">Billing Email:</span>
                <span className="detail-value">{user?.email || 'N/A'}</span>
              </div>
              {billingInfo.transactionId && (
                <div className="billing-detail-row">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">{billingInfo.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment History (Pro Plan Only) */}
        {plan === 'pro' && (
          <div className="payment-history-card">
            <h2>Payment History</h2>
            <div className="payment-history-list">
              {billingInfo?.paymentHistory && billingInfo.paymentHistory.length > 0 ? (
                billingInfo.paymentHistory.map((payment, index) => (
                  <div key={index} className="payment-item">
                    <div className="payment-item-left">
                      <HiOutlineCreditCard className="payment-icon" />
                      <div>
                        <p className="payment-description">{payment.description || 'Pro Optimization - One-time payment'}</p>
                        <p className="payment-date">{formatDate(payment.date)}</p>
                      </div>
                    </div>
                    <div className="payment-item-right">
                      <span className="payment-amount">${payment.amount || '9.00'}</span>
                      <span className="payment-status paid">Paid</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-payments">
                  <HiOutlineClock className="no-payments-icon" />
                  <p>No payment history available</p>
                  {billingInfo?.purchasedDate && (
                    <p className="payment-note">
                      Your purchase on {formatDate(billingInfo.purchasedDate)} will appear here
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Support Section */}
        <div className="support-card">
          <h2>Need Help?</h2>
          <p>If you have questions about your billing or plan, please contact our support team.</p>
          <div className="support-actions">
            <button className="btn-support" onClick={() => navigate('/contact')}>
              Contact Support
            </button>
            <button className="btn-support-secondary" onClick={() => navigate('/privacy')}>
              View Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

