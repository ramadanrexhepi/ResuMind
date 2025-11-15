import React from 'react';
import './ResultsDisplay.css';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineDownload } from 'react-icons/hi';

export default function ResultsDisplay({ results, onClose, onDownloadResume }) {
  if (!results) return null;

  const { analysis, fileName } = results;

  return (
    <div className="results-overlay">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <h2>Analysis Results</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Score Section */}
        <div className="score-section">
          <div className="score-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8"/>
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#2563EB" 
                strokeWidth="8"
                strokeDasharray={`${analysis.score * 2.83} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="score-text">
              <span className="score-number">{analysis.score}</span>
              <span className="score-label">/ 100</span>
            </div>
          </div>
          <div className="score-info">
            <h3>{analysis.overallRating || 'Good'}</h3>
            <p className="file-name">📄 {fileName}</p>
            {analysis.atsCompatibility && (
              <div className="ats-badge">
                ATS Score: {analysis.atsScore || analysis.score}/100
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="results-grid">
          {/* Strengths */}
          <div className="result-card strengths">
            <div className="card-header">
              <HiOutlineCheckCircle className="card-icon" />
              <h3>Strengths</h3>
            </div>
            <ul className="result-list">
              {analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="result-card improvements">
            <div className="card-header">
              <HiOutlineExclamationCircle className="card-icon" />
              <h3>Areas to Improve</h3>
            </div>
            <ul className="result-list">
              {analysis.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Keywords Section */}
        {analysis.suggestedKeywords && (
          <div className="keywords-section">
            <h3>Suggested Keywords for ATS</h3>
            <div className="keywords-list">
              {analysis.suggestedKeywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        )}

        {/* Sections Status */}
        {analysis.sections && (
          <div className="sections-status">
            <div className="status-column">
              <h4>Present Sections</h4>
              <ul>
                {analysis.sections.present.map((section, index) => (
                  <li key={index} className="present">✅ {section}</li>
                ))}
              </ul>
            </div>
            <div className="status-column">
              <h4>Missing Sections</h4>
              <ul>
                {analysis.sections.missing.map((section, index) => (
                  <li key={index} className="missing">❌ {section}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="results-actions">
          <button onClick={onDownloadResume} className="btn-download">
            <HiOutlineDownload />
            Download Optimized Resume
          </button>
          <button onClick={onClose} className="btn-new-upload">
            Upload Another Resume
          </button>
        </div>
      </div>
    </div>
  );
}