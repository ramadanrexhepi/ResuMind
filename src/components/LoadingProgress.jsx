import React from 'react';
import './LoadingProgress.css';

const LoadingProgress = ({ steps, currentStep, message }) => {
  return (
    <div className="loading-progress-overlay">
      <div className="loading-progress-container">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
        </div>

        <h3 className="loading-title">{message || 'Processing...'}</h3>

        <div className="progress-steps">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`progress-step ${
                index < currentStep ? 'completed' :
                index === currentStep ? 'active' :
                'pending'
              }`}
            >
              <div className="step-icon">
                {index < currentStep ? (
                  <span className="check-icon">✓</span>
                ) : index === currentStep ? (
                  <span className="loading-icon">⏳</span>
                ) : (
                  <span className="pending-icon">{index + 1}</span>
                )}
              </div>
              <div className="step-label">{step}</div>
            </div>
          ))}
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>

        <p className="loading-tip">
          💡 <strong>Tip:</strong> Our AI is analyzing every detail to create the perfect resume for you!
        </p>
      </div>
    </div>
  );
};

export default LoadingProgress;
