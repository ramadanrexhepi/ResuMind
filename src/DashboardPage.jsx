import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import { 
  HiOutlineDocumentText, 
  HiOutlineChartBar, 
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineUpload,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTrendingUp,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineCreditCard,
  HiShieldCheck
} from 'react-icons/hi';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    averageScore: 0,
    averageAtsScore: 0,
    recentCount: 0
  });

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

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

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };

    // Prevent body scroll when sidebar is open
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

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Reset state first to ensure fresh data
        setUser(null);
        setAnalyses([]);
        setStats({
          totalAnalyses: 0,
          averageScore: 0,
          averageAtsScore: 0,
          recentCount: 0
        });
        
        // Get user from localStorage or token
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!userData) {
          console.warn('No user data found in localStorage');
          setLoading(false);
          return;
        }
        
        try {
          const parsedUser = JSON.parse(userData);
          
          // Validate user data structure
          if (!parsedUser || (!parsedUser.id && !parsedUser._id)) {
            console.error('Invalid user data structure:', parsedUser);
            setLoading(false);
            return;
          }
          
          setUser(parsedUser);
          
          // Fetch analyses for the user
          const userId = parsedUser.id || parsedUser._id;
          const res = await fetch(`http://localhost:5050/api/user/analyses/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.analyses) {
              const analysesData = data.analyses;
              setAnalyses(analysesData);
              
              // Calculate stats
              const total = analysesData.length;
              const avgScore = total > 0 
                ? Math.round(analysesData.reduce((sum, a) => sum + (a.score || 0), 0) / total)
                : 0;
              const avgAts = total > 0
                ? Math.round(analysesData.reduce((sum, a) => sum + (a.atsScore || 0), 0) / total)
                : 0;
              const recent = analysesData.filter(a => {
                const createdAt = new Date(a.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return createdAt > weekAgo;
              }).length;
              
              setStats({
                totalAnalyses: total,
                averageScore: avgScore,
                averageAtsScore: avgAts,
                recentCount: recent
              });
            }
          } else {
            console.error('Failed to fetch analyses:', res.status, res.statusText);
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const getRatingColor = (rating) => {
    const lowerRating = rating?.toLowerCase() || '';
    if (lowerRating.includes('excellent') || lowerRating.includes('good')) return '#10B981';
    if (lowerRating.includes('fair') || lowerRating.includes('average')) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
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
              <HiOutlineUpload />
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
              className="sidebar-menu-item"
              onClick={() => handleNavClick('/analyses')}
            >
              <HiOutlineDocumentText />
              <span>Analyses</span>
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
              className="sidebar-menu-item"
              onClick={() => handleNavClick('/privacy')}
            >
              <HiShieldCheck />
              <span>Privacy&Policy</span>
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

      <div className="dashboard-container">
        {/* Hamburger Menu Button */}
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <HiOutlineMenu />
        </button>

        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="header-subtitle">Manage your resume analyses and track your progress</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-primary-action"
              onClick={() => navigate('/upload')}
            >
              <HiOutlineUpload />
              Upload Resume
            </button>
            <button 
              className="btn-secondary-action"
              onClick={() => navigate('/generator')}
            >
              <HiOutlineSparkles />
              Generate New
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <HiOutlineDocumentText />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.totalAnalyses}</h3>
              <p className="stat-label">Total Analyses</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F0FDF4', color: '#10B981' }}>
              <HiOutlineChartBar />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.averageScore}%</h3>
              <p className="stat-label">Average Score</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FEF3C7', color: '#F59E0B' }}>
              <HiOutlineTrendingUp />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.averageAtsScore}%</h3>
              <p className="stat-label">Avg ATS Score</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F3E8FF', color: '#9333EA' }}>
              <HiOutlineClock />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.recentCount}</h3>
              <p className="stat-label">This Week</p>
            </div>
          </div>
        </div>

        {/* Analyses Section */}
        <div className="analyses-section">
          <div className="section-header">
            <h2>Recent Analyses</h2>
            {analyses.length > 0 && (
              <button 
                className="view-all-btn"
                onClick={() => {/* Could navigate to full list */}}
              >
                View All
                <HiOutlineArrowRight />
              </button>
            )}
          </div>

          {analyses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <HiOutlineDocumentText />
              </div>
              <h3>No analyses yet</h3>
              <p>Get started by uploading your resume or generating a new one</p>
              <div className="empty-actions">
                <button 
                  className="btn-primary-action"
                  onClick={() => navigate('/upload')}
                >
                  <HiOutlineUpload />
                  Upload Resume
                </button>
                <button 
                  className="btn-secondary-action"
                  onClick={() => navigate('/generator')}
                >
                  <HiOutlineSparkles />
                  Generate Resume
                </button>
              </div>
            </div>
          ) : (
            <div className="analyses-grid">
              {analyses.slice(0, 6).map((analysis) => (
                <div key={analysis._id} className="analysis-card">
                  <div className="card-header">
                    <div className="file-info">
                      <HiOutlineDocumentText className="file-icon" />
                      <div>
                        <h3 className="file-name">{analysis.fileName || 'Untitled Resume'}</h3>
                        <p className="file-date">{formatDate(analysis.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-scores">
                    <div className="score-item">
                      <span className="score-label">Score</span>
                      <span 
                        className="score-value"
                        style={{ color: getScoreColor(analysis.score) }}
                      >
                        {analysis.score || 'N/A'}%
                      </span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">ATS Score</span>
                      <span 
                        className="score-value"
                        style={{ color: getScoreColor(analysis.atsScore) }}
                      >
                        {analysis.atsScore || 'N/A'}%
                      </span>
                    </div>
                  </div>

                  {analysis.overallRating && (
                    <div className="card-rating">
                      <div 
                        className="rating-badge"
                        style={{ 
                          background: `${getRatingColor(analysis.overallRating)}20`,
                          color: getRatingColor(analysis.overallRating)
                        }}
                      >
                        {analysis.overallRating.includes('Excellent') || analysis.overallRating.includes('Good') ? (
                          <HiOutlineCheckCircle />
                        ) : (
                          <HiOutlineXCircle />
                        )}
                        <span>{analysis.overallRating}</span>
                      </div>
                    </div>
                  )}

                  <button 
                    className="card-action-btn"
                    onClick={() => navigate(`/result?id=${analysis._id}`)}
                  >
                    View Details
                    <HiOutlineArrowRight />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
