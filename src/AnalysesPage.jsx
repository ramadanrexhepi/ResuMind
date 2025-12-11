import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnalysesPage.css';
import {
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineTrendingUp,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineCreditCard,
  HiShieldCheck,
  HiOutlineSparkles,
  HiOutlinePaperAirplane
} from 'react-icons/hi';
import { API_ENDPOINTS } from './config/api';

export default function AnalysesPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // AI Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

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

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Close sidebar on Escape key
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

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!userData) {
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const userId = parsedUser.id || parsedUser._id;
      const res = await fetch(API_ENDPOINTS.USER_ANALYSES(userId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analyses) {
          setAnalyses(data.analyses);
        }
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Prepare context about user's analyses
      const analysesContext = analyses.map(a => ({
        fileName: a.fileName,
        score: a.score,
        atsScore: a.atsScore,
        rating: a.overallRating,
        date: a.createdAt
      }));

      const response = await fetch(API_ENDPOINTS.CHAT_WITH_AI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: chatInput,
          context: {
            analyses: analysesContext,
            totalAnalyses: analyses.length,
            averageScore: analyses.length > 0
              ? Math.round(analyses.reduce((sum, a) => sum + (a.score || 0), 0) / analyses.length)
              : 0
          }
        })
      });

      const data = await response.json();

      const aiMessage = {
        role: 'assistant',
        content: data.response || "I'm here to help you understand your resume analyses. What would you like to know?",
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Fallback response
      const aiMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Based on your analyses, I can see you have " + analyses.length + " resume(s) analyzed. How can I help you improve them?",
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getATSBadgeClass = (ats) => {
    if (ats === 'High' || ats >= 80) return 'ats-badge high';
    if (ats === 'Medium' || ats >= 60) return 'ats-badge medium';
    return 'ats-badge low';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredAnalyses = analyses
    .filter(analysis => {
      const atsScore = analysis.atsScore || 0;

      if (filter === 'high' && atsScore < 80) return false;
      if (filter === 'medium' && (atsScore < 60 || atsScore >= 80)) return false;
      if (filter === 'low' && atsScore >= 60) return false;

      if (searchTerm && !analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === 'name') {
        return a.fileName.localeCompare(b.fileName);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + (a.score || 0), 0) / analyses.length)
    : 0;

  const highScoreCount = analyses.filter(a => (a.score || 0) >= 80).length;

  return (
    <div className="analyses-page">
      {/* Hamburger Menu Button */}
      <button className="hamburger-btn" onClick={toggleSidebar}>
        <HiOutlineMenu />
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar Navigation */}
      <nav className={`sidebar-nav ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <HiOutlineX />
          </button>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user.name || 'User'}</p>
              <p className="sidebar-user-email">{user.email}</p>
            </div>
          </div>
        )}

        <ul className="sidebar-menu">
          <li>
            <button className="sidebar-menu-item" onClick={() => handleNavClick('/dashboard')}>
              <HiOutlineHome />
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button className="sidebar-menu-item" onClick={() => handleNavClick('/analyses')}>
              <HiOutlineDocumentText />
              <span>My Analyses</span>
            </button>
          </li>
          <li>
            <button className="sidebar-menu-item" onClick={() => handleNavClick('/billing')}>
              <HiOutlineCreditCard />
              <span>Billing</span>
            </button>
          </li>
          <li>
            <button className="sidebar-menu-item" onClick={() => handleNavClick('/settings')}>
              <HiOutlineCog />
              <span>Settings</span>
            </button>
          </li>
          <li>
            <button className="sidebar-menu-item" onClick={() => handleNavClick('/upgrade')}>
              <HiShieldCheck />
              <span>Upgrade</span>
            </button>
          </li>
          <li className="sidebar-divider"></li>
          <li>
            <button className="sidebar-menu-item sidebar-menu-item-danger" onClick={handleLogout}>
              <HiOutlineLogout />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="analyses-container">
        {/* Header */}
        <div className="analyses-header">
          <div>
            <h1>My Analyses</h1>
            <p className="analyses-subtitle">View and manage all your resume analyses</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <HiOutlineDocumentText />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Analyses</p>
              <h3 className="stat-value">{analyses.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <HiOutlineChartBar />
            </div>
            <div className="stat-info">
              <p className="stat-label">Average Score</p>
              <h3 className="stat-value">{avgScore}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <HiOutlineTrendingUp />
            </div>
            <div className="stat-info">
              <p className="stat-label">High Scores</p>
              <h3 className="stat-value">{highScoreCount}</h3>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="controls-bar">
          <div className="search-box">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <HiOutlineFilter className="filter-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Analyses</option>
              <option value="high">High ATS Score</option>
              <option value="medium">Medium ATS Score</option>
              <option value="low">Needs Improvement</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Analyses List */}
        <div className="analyses-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your analyses...</p>
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="empty-state">
              <HiOutlineDocumentText className="empty-icon" />
              <h3>No analyses found</h3>
              <p>Upload a resume to get started with AI analysis</p>
              <button onClick={() => navigate('/upload')} className="btn-primary">
                Upload Resume
              </button>
            </div>
          ) : (
            filteredAnalyses.map((analysis) => (
              <div key={analysis._id} className="analysis-card">
                <div className="analysis-header-content">
                  <div className="analysis-title">
                    <HiOutlineDocumentText className="doc-icon" />
                    <div>
                      <h3>{analysis.fileName}</h3>
                      <p className="analysis-date">
                        <HiOutlineCalendar />
                        {formatDate(analysis.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="analysis-score-badge" style={{ background: getScoreColor(analysis.score || 0) }}>
                    {analysis.score || 0}
                  </div>
                </div>

                <div className="analysis-body">
                  <div className="analysis-meta">
                    <span className={getATSBadgeClass(analysis.atsScore || 0)}>
                      ATS: {analysis.atsScore || 0}
                    </span>
                    <span className="rating-badge">{analysis.overallRating || 'Not Rated'}</span>
                  </div>
                </div>

                <div className="analysis-actions">
                  <button className="action-btn view" onClick={() => navigate('/result', { state: { analysis } })}>
                    <HiOutlineEye />
                    View Details
                  </button>
                  <button className="action-btn download">
                    <HiOutlineDownload />
                    Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Chat Assistant */}
        <div className="ai-chat-section">
          <div className="chat-header">
            <div className="chat-header-title">
              <HiOutlineSparkles className="chat-icon" />
              <div>
                <h3>AI Resume Assistant</h3>
                <p>Ask me anything about your resume analyses</p>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-empty-state">
                <HiOutlineSparkles className="chat-empty-icon" />
                <p>Ask me questions about your analyses, resume tips, or how to improve your scores!</p>
                <div className="suggested-questions">
                  <button
                    className="suggestion-btn"
                    onClick={() => setChatInput("How can I improve my ATS score?")}
                  >
                    How can I improve my ATS score?
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() => setChatInput("What's my average resume score?")}
                  >
                    What's my average score?
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() => setChatInput("Tips for optimizing my resume")}
                  >
                    Resume optimization tips
                  </button>
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((message, index) => (
                  <div key={index} className={`chat-message ${message.role}`}>
                    <div className="message-content">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-message assistant">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          <div className="chat-input-container">
            <textarea
              className="chat-input"
              placeholder="Ask about your analyses, resume tips, or anything else..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="1"
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || chatLoading}
            >
              <HiOutlinePaperAirplane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
