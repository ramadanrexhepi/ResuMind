import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';
import { applyTheme } from './theme';
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineCreditCard,
  HiOutlineBell,
  HiOutlineLockClosed,
  HiOutlineTrash,
  HiOutlineSave,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle
} from 'react-icons/hi';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5050'
    : '';

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  // Password settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    analysisComplete: true,
    weeklySummary: false,
    productUpdates: true
  });

  // App preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    autoSave: true
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileData({
        name: parsedUser.name || '',
        email: parsedUser.email || ''
      });
    }

    // Load preferences from localStorage
    const savedNotifications = localStorage.getItem('notificationPreferences');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedPreferences = localStorage.getItem('appPreferences');
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setPreferences(parsed);
    }

    setLoading(false);
  }, []);

  // Apply theme whenever preferences.theme changes
  useEffect(() => {
    applyTheme(preferences.theme);
  }, [preferences.theme]);

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
    setBusy(true);
    navigate(path);
    closeSidebar();
  };

  const handleLogout = () => {
    setBusy(true);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/auth');
    closeSidebar();
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setBusy(true);
    setMessage({ type: '', text: '' });

    try {
      // Update user in localStorage
      const updatedUser = {
        ...user,
        name: profileData.name,
        email: profileData.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Here you would typically make an API call to update the user
      // await updateUserProfile(profileData);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
      setBusy(false);
    }
  };

  const savePassword = async () => {
    setSaving(true);
    setBusy(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      setSaving(false);
      setBusy(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long!' });
      setSaving(false);
      return;
    }

    try {
      const body = {
        userId: user?.id,
        email: user?.email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        const errMsg = (data && (data.error || data.message)) || 'Failed to update password';
        setMessage({ type: 'error', text: errMsg });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while updating password.' });
    } finally {
      setSaving(false);
      setBusy(false);
    }
  };

  const saveNotifications = async () => {
    setBusy(true);
    localStorage.setItem('notificationPreferences', JSON.stringify(notifications));
    // slight delay to make loading perceptible
    await new Promise(r => setTimeout(r, 400));
    setMessage({ type: 'success', text: 'Notification preferences saved!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    setBusy(false);
  };

  const savePreferences = async () => {
    setBusy(true);
    localStorage.setItem('appPreferences', JSON.stringify(preferences));
    // slight delay to make loading perceptible
    await new Promise(r => setTimeout(r, 400));
    setMessage({ type: 'success', text: 'Preferences saved!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    setBusy(false);
  };

  const handleDeleteAccount = () => {
    setBusy(true);
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    );

    if (confirmed) {
      // Here you would typically make an API call to delete the account
      // await deleteAccount();
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userPlan');
      localStorage.removeItem('notificationPreferences');
      localStorage.removeItem('appPreferences');
      navigate('/auth');
    } else {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Global busy overlay */}
      {busy && (
        <div className="page-loading-overlay">
          <div className="overlay-spinner"></div>
        </div>
      )}
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
              onClick={() => handleNavClick('/billing')}
            >
              <HiOutlineCreditCard />
              <span>Billing</span>
            </button>
          </li>
          <li>
            <button 
              className="sidebar-menu-item active"
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

      <div className="settings-container">
        {/* Hamburger Menu Button */}
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <HiOutlineMenu />
        </button>

        {/* Header */}
        <div className="settings-header">
          <h1>Settings</h1>
          <p className="settings-subtitle">Manage your account settings and preferences</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`message-alert ${message.type}`}>
            {message.type === 'success' ? (
              <HiOutlineCheckCircle />
            ) : (
              <HiOutlineExclamationCircle />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Settings */}
        <div className="settings-section">
          <div className="section-header">
            <HiOutlineUser className="section-icon" />
            <div>
              <h2>Profile Settings</h2>
              <p>Update your personal information</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Enter your email address"
              />
            </div>

            <button 
              className="btn-save"
              onClick={saveProfile}
              disabled={saving}
            >
              <HiOutlineSave />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Password Settings */}
        <div className="settings-section">
          <div className="section-header">
            <HiOutlineLockClosed className="section-icon" />
            <div>
              <h2>Password</h2>
              <p>Change your account password</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm your new password"
              />
            </div>

            <button 
              className="btn-save"
              onClick={savePassword}
              disabled={saving}
            >
              <HiOutlineSave />
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="settings-section">
          <div className="section-header">
            <HiOutlineBell className="section-icon" />
            <div>
              <h2>Notifications</h2>
              <p>Manage your notification preferences</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="toggle-group">
              <div className="toggle-item">
                <div>
                  <label>Email Notifications</label>
                  <p>Receive notifications via email</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={() => handleNotificationChange('emailNotifications')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div>
                  <label>Analysis Complete</label>
                  <p>Notify when resume analysis is complete</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.analysisComplete}
                    onChange={() => handleNotificationChange('analysisComplete')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div>
                  <label>Weekly Summary</label>
                  <p>Receive a weekly summary of your activity</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.weeklySummary}
                    onChange={() => handleNotificationChange('weeklySummary')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div>
                  <label>Product Updates</label>
                  <p>Receive updates about new features and improvements</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.productUpdates}
                    onChange={() => handleNotificationChange('productUpdates')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <button 
              className="btn-save"
              onClick={saveNotifications}
            >
              <HiOutlineSave />
              Save Preferences
            </button>
          </div>
        </div>

        {/* App Preferences */}
        <div className="settings-section">
          <div className="section-header">
            <HiOutlineCog className="section-icon" />
            <div>
              <h2>App Preferences</h2>
              <p>Customize your app experience</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="toggle-item">
              <div>
                <label>Auto-save</label>
                <p>Automatically save your work</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.autoSave}
                  onChange={() => handlePreferenceChange('autoSave', !preferences.autoSave)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <button 
              className="btn-save"
              onClick={savePreferences}
            >
              <HiOutlineSave />
              Save Preferences
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <div className="section-header">
            <HiOutlineTrash className="section-icon danger" />
            <div>
              <h2>Danger Zone</h2>
              <p>Irreversible and destructive actions</p>
            </div>
          </div>

          <div className="danger-actions">
            <div className="danger-action-item">
              <div>
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all associated data</p>
              </div>
              <button 
                className="btn-danger"
                onClick={handleDeleteAccount}
              >
                <HiOutlineTrash />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

