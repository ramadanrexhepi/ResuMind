import React, { useState, useRef } from 'react';
import './UploadPage.css';
import { HiOutlineUpload, HiOutlineArrowLeft } from 'react-icons/hi';
import { FaLinkedin } from 'react-icons/fa';
import ResultsDisplay from './ResultsDisplay';
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
  
    try {
      if (uploadMethod === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        if (savedUser?.id) formData.append('userId', savedUser.id);
  
        const response = await fetch(API_ENDPOINTS.ANALYZE_FILE, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Upload failed (${response.status}): ${errText || 'Server error'}`);
        }
  
        const data = await response.json();
        console.log('Analysis result:', data);
  
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
          alert('Please enter a valid LinkedIn profile URL');
          setIsAnalyzing(false);
          return;
        }
  
        const response = await fetch(API_ENDPOINTS.ANALYZE_LINKEDIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: linkedinUrl, linkedinText, userId: savedUser?.id }),
        });
  
        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Analysis failed (${response.status}): ${errText || 'Server error'}`);
        }
  
        const data = await response.json();
        console.log('LinkedIn analysis:', data);
        
        // ✅ Store LinkedIn URL and text for later use
        setAnalysisResults({ 
          ...data, 
          fileName: 'LinkedIn Profile', 
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
              fileName: 'LinkedIn Profile',
              fileSize: 0,
              analysis: data.analysis,
              linkedinUrl: linkedinUrl
            })
          });
        } catch (_) {}
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloseResults = () => {
    setAnalysisResults(null);
    setSelectedFile(null);
    setLinkedinUrl('');
    setLinkedinText('');
  };

  const handleDownloadResume = async () => {
    try {
      console.log('📥 Starting resume download...', analysisResults);
      
      const buildAndDownload = async (resp, filenameBase) => {
        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('Server error:', errorText);
          throw new Error('Resume generation failed');
        }
        const blob = await resp.blob();
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
      alert(`Failed to download resume: ${error.message}`);
    }
  };

  return (
    <div className="upload-page">
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
            <h3 className="linkedin-title">Paste Your LinkedIn Profile URL</h3>
            <p className="linkedin-subtitle">We'll analyze your profile and generate insights</p>
            
            <div className="linkedin-input-wrapper">
              <input
                type="url"
                placeholder="https://www.linkedin.com/in/yourname"
                value={linkedinUrl}
                onChange={handleLinkedinChange}
                className="linkedin-input"
              />
            </div>

            <p className="linkedin-help">
              Go to your LinkedIn profile and copy the URL from your browser
            </p>
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
          onDownloadResume={handleDownloadResume}
        />
      )}
    </div>
  );
}