import React, { useState } from 'react';
import './GeneratorPage.css';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineSparkles, HiOutlineCheck } from 'react-icons/hi';

export default function GeneratorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    portfolioUrl: '',

    // Professional Summary
    jobTitle: '',
    yearsExperience: '',
    targetRole: '',
    keySkills: '',

    // Work Experience
    experiences: [
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        responsibilities: '',
        achievements: ''
      }
    ],

    // Education
    education: [
      {
        institution: '',
        degree: '',
        field: '',
        graduationYear: '',
        gpa: ''
      }
    ],

    // Skills
    technicalSkills: '',
    softSkills: '',
    languages: '',
    certifications: '',

    // Additional
    projects: '',
    awards: '',
    interests: ''
  });

  const totalSteps = 6;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperiences = [...formData.experiences];
    newExperiences[index][field] = value;
    setFormData(prev => ({
      ...prev,
      experiences: newExperiences
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        responsibilities: '',
        achievements: ''
      }]
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        graduationYear: '',
        gpa: ''
      }]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
  
    try {
      const response = await fetch("http://localhost:5050/api/generate/resume-from-scratch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/pdf" // 👈 Tells backend to send raw PDF bytes
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Failed to generate resume.");
      }
  
      // 👇 Important: read as ArrayBuffer (not blob/text)
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData.fullName?.replace(/\s+/g, "_") || "Candidate"}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  
      alert("✅ Resume generated successfully!");
    } catch (err) {
      console.error("❌ Resume generation failed:", err);
      alert("❌ Failed to generate resume. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Personal Information</h2>
            <p className="step-description">Let's start with your basic contact details</p>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="New York, NY"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>

              <div className="form-group">
                <label>Portfolio/Website</label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                  placeholder="johndoe.com"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Professional Summary</h2>
            <p className="step-description">Tell us about your professional background</p>

            <div className="form-group">
              <label>Current/Target Job Title *</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>

            <div className="form-group">
              <label>Years of Experience *</label>
              <select
                value={formData.yearsExperience}
                onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                required
              >
                <option value="">Select...</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Role/Industry *</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => handleInputChange('targetRole', e.target.value)}
                placeholder="e.g., Full Stack Development in Tech Industry"
                required
              />
            </div>

            <div className="form-group">
              <label>Key Skills (comma-separated) *</label>
              <textarea
                value={formData.keySkills}
                onChange={(e) => handleInputChange('keySkills', e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js, Team Leadership, Project Management"
                rows="3"
                required
              />
              <small>List your most important skills that define your expertise</small>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>Work Experience</h2>
            <p className="step-description">Add your professional work history</p>

            {formData.experiences.map((exp, index) => (
              <div key={index} className="experience-block">
                <div className="block-header">
                  <h3>Experience #{index + 1}</h3>
                  {formData.experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      placeholder="Google Inc."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                      placeholder="Software Engineer"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      disabled={exp.currentlyWorking}
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={exp.currentlyWorking}
                      onChange={(e) => handleExperienceChange(index, 'currentlyWorking', e.target.checked)}
                    />
                    I currently work here
                  </label>
                </div>

                <div className="form-group">
                  <label>Key Responsibilities *</label>
                  <textarea
                    value={exp.responsibilities}
                    onChange={(e) => handleExperienceChange(index, 'responsibilities', e.target.value)}
                    placeholder="• Developed web applications using React and Node.js&#10;• Collaborated with cross-functional teams&#10;• Mentored junior developers"
                    rows="4"
                    required
                  />
                  <small>Use bullet points (•) or line breaks for each responsibility</small>
                </div>

                <div className="form-group">
                  <label>Key Achievements (with metrics if possible)</label>
                  <textarea
                    value={exp.achievements}
                    onChange={(e) => handleExperienceChange(index, 'achievements', e.target.value)}
                    placeholder="• Improved application performance by 40%&#10;• Led team of 5 developers to deliver project 2 weeks ahead of schedule&#10;• Reduced bug reports by 30% through improved testing"
                    rows="4"
                  />
                  <small>Quantify your impact with numbers when possible</small>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addExperience}
              className="add-btn"
            >
              + Add Another Experience
            </button>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Education</h2>
            <p className="step-description">Add your educational background</p>

            {formData.education.map((edu, index) => (
              <div key={index} className="experience-block">
                <div className="block-header">
                  <h3>Education #{index + 1}</h3>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Institution Name *</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    placeholder="Harvard University"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Degree *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      placeholder="Bachelor of Science"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Field of Study *</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                      placeholder="Computer Science"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Graduation Year *</label>
                    <input
                      type="number"
                      value={edu.graduationYear}
                      onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)}
                      placeholder="2020"
                      min="1950"
                      max="2030"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>GPA (optional)</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                      placeholder="3.8/4.0"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addEducation}
              className="add-btn"
            >
              + Add Another Education
            </button>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h2>Skills & Certifications</h2>
            <p className="step-description">Highlight your technical and soft skills</p>

            <div className="form-group">
              <label>Technical Skills *</label>
              <textarea
                value={formData.technicalSkills}
                onChange={(e) => handleInputChange('technicalSkills', e.target.value)}
                placeholder="JavaScript, React, Node.js, Python, SQL, MongoDB, AWS, Docker, Git"
                rows="3"
                required
              />
              <small>Separate skills with commas</small>
            </div>

            <div className="form-group">
              <label>Soft Skills</label>
              <textarea
                value={formData.softSkills}
                onChange={(e) => handleInputChange('softSkills', e.target.value)}
                placeholder="Leadership, Communication, Problem Solving, Team Collaboration, Time Management"
                rows="3"
              />
              <small>Separate skills with commas</small>
            </div>

            <div className="form-group">
              <label>Languages</label>
              <input
                type="text"
                value={formData.languages}
                onChange={(e) => handleInputChange('languages', e.target.value)}
                placeholder="English (Native), Spanish (Fluent), French (Intermediate)"
              />
            </div>

            <div className="form-group">
              <label>Certifications</label>
              <textarea
                value={formData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                placeholder="• AWS Certified Solutions Architect&#10;• Google Cloud Professional&#10;• Scrum Master Certification"
                rows="4"
              />
              <small>List each certification on a new line</small>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-content">
            <h2>Additional Information</h2>
            <p className="step-description">Add projects, awards, or interests (optional but recommended)</p>

            <div className="form-group">
              <label>Notable Projects</label>
              <textarea
                value={formData.projects}
                onChange={(e) => handleInputChange('projects', e.target.value)}
                placeholder="• E-commerce Platform - Built a full-stack shopping platform with 10k+ users&#10;• AI Chatbot - Developed ML-powered customer service bot&#10;• Open Source Contributor - Active contributor to React and Node.js projects"
                rows="5"
              />
              <small>Describe projects with impact and technologies used</small>
            </div>

            <div className="form-group">
              <label>Awards & Achievements</label>
              <textarea
                value={formData.awards}
                onChange={(e) => handleInputChange('awards', e.target.value)}
                placeholder="• Employee of the Year 2023&#10;• Best Innovation Award&#10;• Published research paper in IEEE"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Interests & Hobbies</label>
              <input
                type="text"
                value={formData.interests}
                onChange={(e) => handleInputChange('interests', e.target.value)}
                placeholder="Technology blogging, Open source contribution, Public speaking"
              />
              <small>Interests that show personality or align with your career</small>
            </div>

            <div className="review-section">
              <h3>Ready to Generate!</h3>
              <p>Review your information and click generate to create your professional resume.</p>
              
              <div className="review-checklist">
                <div className="checklist-item">
                  <HiOutlineCheck /> Personal information completed
                </div>
                <div className="checklist-item">
                  <HiOutlineCheck /> Professional summary added
                </div>
                <div className="checklist-item">
                  <HiOutlineCheck /> Work experience included
                </div>
                <div className="checklist-item">
                  <HiOutlineCheck /> Education details provided
                </div>
                <div className="checklist-item">
                  <HiOutlineCheck /> Skills listed
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="generator-page">
      {/* Header */}
      <div className="generator-header">
        <button 
          onClick={() => window.navigate ? window.navigate('dashboard') : window.history.back()} 
          className="back-button"
        >
          <HiOutlineArrowLeft />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <p className="progress-text">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Main Content */}
      <div className="generator-content">
        <div className="generator-card">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="step-navigation">
            {currentStep > 1 && (
              <button onClick={prevStep} className="nav-btn prev-btn">
                <HiOutlineArrowLeft />
                Previous
              </button>
            )}

            {currentStep < totalSteps ? (
              <button onClick={nextStep} className="nav-btn next-btn">
                Next
                <HiOutlineArrowRight />
              </button>
            ) : (
              <button 
                onClick={handleGenerate} 
                className="nav-btn generate-btn"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner" />
                    Generating...
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles />
                    Generate Resume
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}