import React, { useState, useRef } from 'react';
import './UploadPage.css';
import { HiOutlineUpload, HiOutlineArrowLeft } from 'react-icons/hi';
import { FaLinkedin } from 'react-icons/fa';
import ResultsDisplay from './ResultsDisplay';
import LoadingProgress from './components/LoadingProgress';
import ResumePreview from './components/ResumePreview';
import SEOHead from './components/SEOHead';
import { API_BASE_URL, API_ENDPOINTS } from './config/api';

export default function UploadPage() {
  const savedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch (_) { return null; }
  })();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinText, setLinkedinText] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [progressStep, setProgressStep] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [resumeHTML, setResumeHTML] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (validTypes.includes(file.type)) {
      setSelectedFile(file);
      setLinkedinUrl('');
      console.log('File selected:', file.name);
    } else {
      alert('Please upload a PDF or Word document');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleLinkedinChange = (e) => {
    setLinkedinUrl(e.target.value);
    if (e.target.value) {
      setSelectedFile(null);
    }
  };

  const handleLinkedinTextChange = (e) => {
    setLinkedinText(e.target.value);
    if (e.target.value) {
      setSelectedFile(null);
    }
  };

  const isValidLinkedinUrl = (url) => {
    const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|profile)\/[a-zA-Z0-9_-]+\/?$/;
    return linkedinPattern.test(url);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgressStep(0);

    try {
      if (uploadMethod === 'file' && selectedFile) {
        setProgressMessage('Uploading your resume...');
        setProgressStep(0);

        const formData = new FormData();
        formData.append('resume', selectedFile);
        if (savedUser?.id) formData.append('userId', savedUser.id);

        setProgressMessage('Processing document...');
        setProgressStep(1);

        const response = await fetch(API_ENDPOINTS.ANALYZE_FILE, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Upload failed: ${errText || 'Please check your file and try again.'}`);
        }

        setProgressMessage('Analyzing with AI...');
        setProgressStep(2);

        const data = await response.json();
        console.log('Analysis result:', data);

        setProgressMessage('Generating insights...');
        setProgressStep(3);
  
        setAnalysisResults({ 
          ...data, 
          type: 'file',
          // Store the original file for later use
          originalFile: selectedFile 
        });
  
        // Persist analysis
        try {
          await fetch(API_ENDPOINTS.SAVE_ANALYSIS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: savedUser?.id,
              analysisType: 'file',
              fileName: data.fileName || selectedFile.name,
              fileSize: selectedFile.size,
              analysis: data.analysis,
              optimizedResume: data.optimizedResume
            })
          });
        } catch (_) {}
  
      } else if (uploadMethod === 'linkedin' && linkedinUrl) {
        if (!isValidLinkedinUrl(linkedinUrl)) {
          throw new Error('Invalid LinkedIn URL format. Please use format: https://linkedin.com/in/yourname');
        }

        setProgressMessage('Connecting to LinkedIn...');
        setProgressStep(0);

        setProgressMessage('Extracting profile data...');
        setProgressStep(1);

        const response = await fetch(API_ENDPOINTS.ANALYZE_LINKEDIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: linkedinUrl, linkedinText, userId: savedUser?.id }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`LinkedIn analysis failed: ${errText || 'Please make sure you pasted your profile text or check your URL.'}`);
        }

        setProgressMessage('Analyzing your profile...');
        setProgressStep(2);

        const data = await response.json();
        console.log('LinkedIn analysis:', data);

        setProgressMessage('Generating recommendations...');
        setProgressStep(3);

        // Use real name from LinkedIn profile
        const displayName = data.fullName || data.analysis?.fullName || 'LinkedIn Profile';
        const fileName = displayName === 'LinkedIn Profile' ? displayName : `${displayName} - LinkedIn Profile`;

        // ✅ Store LinkedIn URL and text for later use
        setAnalysisResults({
          ...data,
          fileName: fileName,
          type: 'linkedin',
          linkedinUrl: linkedinUrl,
          linkedinText: linkedinText
        });

        // Persist
        try {
          await fetch(API_ENDPOINTS.SAVE_ANALYSIS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: savedUser?.id,
              analysisType: 'linkedin',
              fileName: fileName,
              fileSize: 0,
              analysis: data.analysis,
              linkedinUrl: linkedinUrl
            })
          });
        } catch (_) {}
      }
    } catch (error) {
      console.error('Error:', error);
      // Better error messages
      let errorMessage = 'Analysis failed. ';

      if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Network error - please check your internet connection and try again.';
      } else if (error.message.includes('LinkedIn')) {
        errorMessage += error.message;
      } else if (error.message.includes('Upload failed')) {
        errorMessage += 'File upload error - please make sure your file is a valid PDF or DOCX under 10MB.';
      } else {
        errorMessage += error.message || 'Please try again or contact support if the issue persists.';
      }

      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
      setProgressStep(0);
      setProgressMessage('');
    }
  };

  const handleCloseResults = () => {
    setAnalysisResults(null);
    setSelectedFile(null);
    setLinkedinUrl('');
    setLinkedinText('');
  };

  const handleShowPreview = async () => {
    try {
      setIsAnalyzing(true);
      setProgressMessage('Generating resume preview...');
      setProgressStep(0);

      // Prepare form data for the preview request
      const formData = new FormData();

      // Add all analysis data
      if (analysisResults?.analysis?.fullName) {
        formData.append('fullName', analysisResults.analysis.fullName);
      }
      if (analysisResults?.analysis?.email) {
        formData.append('email', analysisResults.analysis.email);
      }
      if (analysisResults?.analysis?.phone) {
        formData.append('phone', analysisResults.analysis.phone);
      }
      if (analysisResults?.analysis?.location) {
        formData.append('location', analysisResults.analysis.location);
      }

      // Add LinkedIn data if available
      if (analysisResults?.type === 'linkedin') {
        if (analysisResults.linkedinUrl) {
          formData.append('linkedinUrl', analysisResults.linkedinUrl);
        }
        if (analysisResults.linkedinText) {
          formData.append('linkedinText', analysisResults.linkedinText);
        }
      }

      // Add file if available
      if (analysisResults?.type === 'file' && (selectedFile || analysisResults.originalFile)) {
        const fileToUpload = selectedFile || analysisResults.originalFile;
        formData.append('resume', fileToUpload);
      }

      // Add complete analysis data
      if (analysisResults?.analysis) {
        formData.append('analysis', JSON.stringify(analysisResults.analysis));
      }

      setProgressMessage('AI is creating your optimized resume...');
      setProgressStep(1);

      // Call the preview endpoint to get HTML
      const response = await fetch(API_ENDPOINTS.GENERATE_PREVIEW, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // If endpoint fails (404), use fallback mock HTML
        console.warn('Preview endpoint not available, using fallback preview');
        const mockHTML = generatePreviewHTML(analysisResults);
        setResumeHTML(mockHTML);
        setShowPreview(true);
        return;
      }

      const data = await response.json();

      setProgressMessage('Preview ready!');
      setProgressStep(2);

      // Show the AI-generated HTML
      setResumeHTML(data.html);
      setShowPreview(true);

    } catch (error) {
      console.error('Error generating preview:', error);

      // Fallback to mock HTML on any error
      console.warn('Using fallback preview due to error');
      const mockHTML = generatePreviewHTML(analysisResults);
      setResumeHTML(mockHTML);
      setShowPreview(true);
    } finally {
      setIsAnalyzing(false);
      setProgressStep(0);
      setProgressMessage('');
    }
  };

  const generatePreviewHTML = (data) => {
    const fullName = data?.analysis?.fullName || 'Your Name';
    const email = data?.analysis?.email || 'your.email@example.com';
    const phone = data?.analysis?.phone || '(123) 456-7890';
    const location = data?.analysis?.location || 'City, State';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 40px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          h1 {
            margin: 0;
            font-size: 32px;
            color: #1f2937;
          }
          .contact {
            margin-top: 10px;
            font-size: 14px;
            color: #6b7280;
          }
          .section {
            margin: 30px 0;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
          }
          .content {
            margin-left: 20px;
          }
          .preview-note {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="preview-note">
          📝 <strong>Preview Mode:</strong> This is a preview of your optimized resume. The final PDF will have professional formatting and styling.
        </div>

        <div class="header">
          <h1>${fullName}</h1>
          <div class="contact">
            ${email} • ${phone} • ${location}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="content">
            Results-driven professional with proven expertise in delivering high-quality work.
            Strong analytical and problem-solving skills with a track record of success.
          </div>
        </div>

        <div class="section">
          <div class="section-title">Key Strengths</div>
          <div class="content">
            ${data?.analysis?.strengths?.map(s => `• ${s}`).join('<br>') || 'Loading strengths...'}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Skills</div>
          <div class="content">
            ${data?.analysis?.suggestedKeywords?.join(' • ') || 'Professional skills'}
          </div>
        </div>

        <div class="preview-note">
          ✨ <strong>Note:</strong> The complete resume will include your full experience, education, and accomplishments with ATS-optimized formatting.
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadResume = async () => {
    try {
      console.log('📥 Starting resume download...', analysisResults);

      setIsAnalyzing(true);
      setProgressMessage('Preparing your resume...');
      setProgressStep(0);

      const buildAndDownload = async (resp, filenameBase) => {
        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('Server error:', errorText);
          throw new Error('Resume generation failed - please try again or contact support');
        }

        setProgressMessage('Creating PDF...');
        setProgressStep(2);

        const blob = await resp.blob();

        setProgressMessage('Finalizing download...');
        setProgressStep(3);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filenameBase}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      };
  
      const filenameBase = analysisResults?.analysis?.fullName 
        ? `${analysisResults.analysis.fullName.replace(/\s+/g, '_')}_Resume`
        : `optimized_${analysisResults.fileName || 'resume'}`;
  
      const formData = new FormData();
  
      // ✅ Add full name if available
      if (analysisResults?.analysis?.fullName) {
        formData.append('fullName', analysisResults.analysis.fullName);
      }
      
      // ✅ Add email if available
      if (analysisResults?.analysis?.email) {
        formData.append('email', analysisResults.analysis.email);
      }
      
      // ✅ Add phone if available
      if (analysisResults?.analysis?.phone) {
        formData.append('phone', analysisResults.analysis.phone);
      }
      
      // ✅ Add location if available
      if (analysisResults?.analysis?.location) {
        formData.append('location', analysisResults.analysis.location);
      }
  
      // ✅ Handle LinkedIn-specific data
      if (analysisResults?.type === 'linkedin') {
        console.log('📎 Adding LinkedIn data to form...');
        
        // Primary LinkedIn URL from analysis results
        if (analysisResults.linkedinUrl) {
          formData.append('linkedinUrl', analysisResults.linkedinUrl);
          console.log('🔗 LinkedIn URL added:', analysisResults.linkedinUrl);
        }
        
        // Optional LinkedIn text data
        if (analysisResults.linkedinText) {
          formData.append('linkedinText', analysisResults.linkedinText);
        }
        
        // Fallback to stored state if not in results
        if (!analysisResults.linkedinUrl && linkedinUrl) {
          formData.append('linkedinUrl', linkedinUrl);
          console.log('🔗 LinkedIn URL from state:', linkedinUrl);
        }
        
        if (!analysisResults.linkedinText && linkedinText) {
          formData.append('linkedinText', linkedinText);
        }
      }
      
      // ✅ Handle file-based resume
      if (analysisResults?.type === 'file' && (selectedFile || analysisResults.originalFile)) {
        const fileToUpload = selectedFile || analysisResults.originalFile;
        formData.append('resume', fileToUpload);
        formData.append('fileName', fileToUpload.name);
        console.log('📄 File added:', fileToUpload.name);
      } else if (analysisResults?.fileName) {
        formData.append('fileName', analysisResults.fileName);
      }
  
      // ✅ Add portfolio URL if available
      if (analysisResults?.analysis?.portfolioUrl) {
        formData.append('portfolioUrl', analysisResults.analysis.portfolioUrl);
        console.log('🌐 Portfolio URL added:', analysisResults.analysis.portfolioUrl);
      }
  
      // ✅ Add complete analysis data as JSON string
      if (analysisResults?.analysis) {
        formData.append('analysis', JSON.stringify(analysisResults.analysis));
        console.log('📊 Analysis data added');
      }
      
      // ✅ Add analysis type
      formData.append('analysisType', analysisResults?.type || 'unknown');
  
      setProgressMessage('Generating optimized resume...');
      setProgressStep(1);

      console.log('🚀 Sending request to server...');

      // ✅ Send to optimized resume endpoint
      const resp = await fetch(API_ENDPOINTS.GENERATE_OPTIMIZED, {
        method: 'POST',
        body: formData,
      });

      console.log('✅ Response received:', resp.status);
      
      if (resp.status === 404) {
        console.warn('⚠️ Optimized endpoint not found, trying legacy...');
        const respLegacy = await fetch(API_ENDPOINTS.GENERATE_RESUME, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysis: analysisResults.analysis,
            fileName: analysisResults.fileName || (selectedFile?.name || 'resume'),
          }),
        });
        await buildAndDownload(respLegacy, filenameBase);
      } else {
        await buildAndDownload(resp, filenameBase);
      }
      
      console.log('🎉 Resume downloaded successfully!');

    } catch (error) {
      console.error('❌ Error downloading resume:', error);

      let errorMessage = 'Failed to generate resume. ';
      if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Network error - please check your connection and try again.';
      } else if (error.message.includes('generation failed')) {
        errorMessage += 'Our AI encountered an issue. Please try again or contact support.';
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
      setProgressStep(0);
      setProgressMessage('');
    }
  };

  return (
    <div className="upload-page">
      <SEOHead
        title="Upload Resume - AI Analysis & Optimization | ResuMind"
        description="Upload your resume or LinkedIn profile for instant AI-powered analysis. Get ATS scoring, personalized recommendations, and optimization suggestions to improve your job application success rate."
        keywords="resume upload, resume analysis, ATS checker, LinkedIn analyzer, resume scanner, CV analysis, resume feedback"
      />
      <button 
        onClick={() => window.navigate ? window.navigate('dashboard') : window.history.back()} 
        className="back-button"
      >
        <HiOutlineArrowLeft />
        <span>Back to Home</span>
      </button>

      <div className="upload-container">
        <h1 className="upload-title">Upload Your Resume</h1>
        <p className="upload-subtitle">Upload your resume or share your LinkedIn profile for AI analysis</p>

        <div className="upload-toggle">
          <button 
            className={uploadMethod === 'file' ? 'active' : ''}
            onClick={() => setUploadMethod('file')}
          >
            <HiOutlineUpload style={{ width: '18px', height: '18px' }} />
            Upload File
          </button>
          <button 
            className={uploadMethod === 'linkedin' ? 'active' : ''}
            onClick={() => setUploadMethod('linkedin')}
          >
            <FaLinkedin style={{ width: '18px', height: '18px' }} />
            LinkedIn Profile
          </button>
        </div>

        {uploadMethod === 'file' && (
          <div 
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-icon-wrapper">
              <div className="upload-icon-circle">
                <HiOutlineUpload className="upload-icon" />
              </div>
            </div>

            <p className="drop-text">
              {selectedFile 
                ? `Selected: ${selectedFile.name}` 
                : 'Drop your resume here or click to browse'}
            </p>
            <p className="drop-subtext">Supports PDF and Word documents</p>

            <button 
              onClick={onButtonClick} 
              className="choose-file-btn"
            >
              Choose File
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {uploadMethod === 'linkedin' && (
          <div className="linkedin-section">
            <div className="linkedin-icon-wrapper">
              <FaLinkedin className="linkedin-icon" />
            </div>
            <h3 className="linkedin-title">Analyze Your LinkedIn Profile</h3>
            <p className="linkedin-subtitle">We'll extract your information and provide AI-powered insights</p>

            <div className="linkedin-input-wrapper">
              <label className="input-label">LinkedIn Profile URL</label>
              <input
                type="url"
                placeholder="https://www.linkedin.com/in/yourname"
                value={linkedinUrl}
                onChange={handleLinkedinChange}
                className="linkedin-input"
              />
              <p className="input-help">
                Go to your LinkedIn profile and copy the URL from your browser
              </p>
            </div>

            <div className="linkedin-text-wrapper" style={{ marginTop: '20px' }}>
              <label className="input-label">
                Profile Text (Recommended for better accuracy)
                <span style={{ fontSize: '12px', fontWeight: 'normal', marginLeft: '8px', color: '#666' }}>
                  - Copy your entire LinkedIn profile and paste here
                </span>
              </label>
              <textarea
                placeholder="Paste your LinkedIn profile text here... Include your name, headline, about section, experience, education, and skills for the most accurate AI analysis."
                value={linkedinText}
                onChange={handleLinkedinTextChange}
                className="linkedin-textarea"
                rows="8"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  marginTop: '8px'
                }}
              />
              <p className="input-help" style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                💡 <strong>How to copy:</strong> Open your LinkedIn profile, select all text (Ctrl+A / Cmd+A), copy (Ctrl+C / Cmd+C), and paste here. This helps our AI extract your real name and provide accurate analysis.
              </p>
            </div>
          </div>
        )}

        {(selectedFile || linkedinUrl) && (
          <div className="action-section">
            {selectedFile && (
              <div className="file-info-compact">
                <span className="file-icon">📄</span>
                <div className="file-details">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => setSelectedFile(null)}
                >
                  ✕
                </button>
              </div>
            )}

            {linkedinUrl && (
              <div className="linkedin-info-compact">
                <FaLinkedin className="linkedin-icon-small" />
                <div className="linkedin-details">
                  <p className="linkedin-url-display">{linkedinUrl}</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => setLinkedinUrl('')}
                >
                  ✕
                </button>
              </div>
            )}

            <button 
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '🔄 Analyzing...' : `Analyze ${uploadMethod === 'file' ? 'Resume' : 'Profile'}`}
            </button>
          </div>
        )}
      </div>

      {/* Results Display */}
      {analysisResults && (
        <ResultsDisplay
          results={analysisResults}
          onClose={handleCloseResults}
          onDownloadResume={handleShowPreview}
        />
      )}

      {/* Loading Progress */}
      {isAnalyzing && (
        <LoadingProgress
          steps={
            uploadMethod === 'file'
              ? ['Uploading resume', 'Processing document', 'AI analysis', 'Generating insights']
              : ['Connecting to LinkedIn', 'Extracting data', 'AI analysis', 'Generating recommendations']
          }
          currentStep={progressStep}
          message={progressMessage}
        />
      )}

      {/* Resume Preview Modal */}
      {showPreview && resumeHTML && (
        <ResumePreview
          resumeHTML={resumeHTML}
          originalData={analysisResults}
          onDownload={() => {
            setShowPreview(false);
            handleDownloadResume();
          }}
          onEdit={(editedHTML) => {
            setResumeHTML(editedHTML);
          }}
          onClose={() => setShowPreview(false)}
          onRegenerate={() => {
            setShowPreview(false);
            alert('Regenerate feature coming soon! For now, please upload again to get a new analysis.');
          }}
          isGenerating={isAnalyzing}
        />
      )}
    </div>
  );
}