import React, { useState } from 'react';
import './ResumePreview.css';
import {
  HiOutlineDownload,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineDocumentText
} from 'react-icons/hi';

const ResumePreview = ({
  resumeHTML,
  originalData,
  onDownload,
  onEdit,
  onClose,
  onRegenerate,
  isGenerating = false
}) => {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'compare'
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedHTML, setEditedHTML] = useState(resumeHTML);

  const handleDownloadClick = () => {
    if (window.confirm('Download this resume as PDF?')) {
      onDownload();
    }
  };

  const handleEditSave = () => {
    // Update the preview with edited content
    setShowEditModal(false);
    // Could call onEdit callback here if needed
  };

  return (
    <div className="resume-preview-overlay">
      <div className="resume-preview-container">
        {/* Header */}
        <div className="preview-header">
          <div className="preview-header-left">
            <HiOutlineEye className="preview-icon" />
            <h2>Resume Preview</h2>
          </div>
          <button onClick={onClose} className="preview-close-btn" title="Close">
            <HiOutlineX />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <button
            className={`toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            <HiOutlineDocumentText />
            Preview
          </button>
          <button
            className={`toggle-btn ${viewMode === 'compare' ? 'active' : ''}`}
            onClick={() => setViewMode('compare')}
          >
            <HiOutlineEye />
            Compare
          </button>
        </div>

        {/* Preview Content */}
        <div className="preview-content">
          {viewMode === 'preview' ? (
            <div className="preview-single">
              <div className="preview-label">Generated Resume</div>
              <div className="resume-viewer">
                <iframe
                  srcDoc={editedHTML || resumeHTML}
                  title="Resume Preview"
                  className="resume-iframe"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </div>
          ) : (
            <div className="preview-comparison">
              <div className="preview-side">
                <div className="preview-label">Original Analysis</div>
                <div className="resume-viewer">
                  <div className="original-data-viewer">
                    <div className="data-section">
                      <h3>Profile Summary</h3>
                      <p><strong>Name:</strong> {originalData?.analysis?.fullName || 'N/A'}</p>
                      <p><strong>Email:</strong> {originalData?.analysis?.email || 'N/A'}</p>
                      <p><strong>Location:</strong> {originalData?.analysis?.location || 'N/A'}</p>
                    </div>

                    <div className="data-section">
                      <h3>Analysis Score</h3>
                      <div className="score-display">
                        {originalData?.analysis?.score || 0}/100
                      </div>
                      <p className="rating">{originalData?.analysis?.overallRating || 'N/A'}</p>
                    </div>

                    <div className="data-section">
                      <h3>Strengths</h3>
                      <ul>
                        {originalData?.analysis?.strengths?.slice(0, 5).map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        )) || <li>No strengths listed</li>}
                      </ul>
                    </div>

                    <div className="data-section">
                      <h3>Improvements</h3>
                      <ul>
                        {originalData?.analysis?.improvements?.slice(0, 5).map((improvement, idx) => (
                          <li key={idx}>{improvement}</li>
                        )) || <li>No improvements listed</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="preview-divider"></div>

              <div className="preview-side">
                <div className="preview-label">Optimized Resume</div>
                <div className="resume-viewer">
                  <iframe
                    srcDoc={editedHTML || resumeHTML}
                    title="Optimized Resume Preview"
                    className="resume-iframe"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="preview-actions">
          <button
            className="action-btn secondary"
            onClick={() => setShowEditModal(true)}
            disabled={isGenerating}
          >
            <HiOutlinePencil />
            Quick Edit
          </button>

          <button
            className="action-btn secondary"
            onClick={onRegenerate}
            disabled={isGenerating}
          >
            <HiOutlineRefresh />
            Regenerate
          </button>

          <button
            className="action-btn primary"
            onClick={handleDownloadClick}
            disabled={isGenerating}
          >
            <HiOutlineDownload />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        {/* Quick Edit Modal */}
        {showEditModal && (
          <div className="edit-modal-overlay">
            <div className="edit-modal">
              <div className="edit-modal-header">
                <h3>Quick Edit Resume</h3>
                <button onClick={() => setShowEditModal(false)} className="modal-close-btn">
                  <HiOutlineX />
                </button>
              </div>

              <div className="edit-modal-content">
                <p className="edit-note">
                  💡 <strong>Tip:</strong> Make quick text changes directly in the HTML. For major changes, use Regenerate.
                </p>
                <textarea
                  className="edit-textarea"
                  value={editedHTML || resumeHTML}
                  onChange={(e) => setEditedHTML(e.target.value)}
                  rows="20"
                  spellCheck="false"
                />
              </div>

              <div className="edit-modal-actions">
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    setEditedHTML(resumeHTML);
                    setShowEditModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="action-btn primary"
                  onClick={handleEditSave}
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
