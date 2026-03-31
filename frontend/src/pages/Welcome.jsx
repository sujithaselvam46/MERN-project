import React from 'react';
import { useNavigate } from 'react-router-dom';
import './welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');

  return (
    <div className="welcome-wrapper">
      {/* Animated Background Elements */}
      <div className="floating-element element-1"></div>
      <div className="floating-element element-2"></div>
      <div className="floating-element element-3"></div>

      <div className="welcome-container">
        <div className="welcome-content">
          {/* Hero Title */}
          <div className="hero-section">
            <h1 className="hero-title animate-slide-up">
              AI Resume Analyzer
            </h1>
            <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Get instant AI-powered insights on your resume
            </p>
          </div>

          {/* Features Grid */}
          <div className="features-grid animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="feature-card glass-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Powered</h3>
              <p>Advanced machine learning analysis</p>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Results</h3>
              <p>Get analysis in seconds</p>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon">📊</div>
              <h3>Detailed Insights</h3>
              <p>Strengths, weaknesses, suggestions</p>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon">✨</div>
              <h3>Multiple Roles</h3>
              <p>Analyze for any job position</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="cta-buttons animate-slide-up" style={{ animationDelay: '0.6s' }}>
            {isLoggedIn ? (
              <button 
                className="btn btn-primary btn-large"
                onClick={() => navigate('/home')}
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </button>
                <button 
                  className="btn btn-secondary btn-large"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          {/* Benefits Section */}
          <div className="benefits-section animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <h2>Why Use Our Analyzer?</h2>
            <ul className="benefits-list">
              <li>✅ Improve your resume before applying</li>
              <li>✅ Understand what employers look for</li>
              <li>✅ Track your progress over time</li>
              <li>✅ Get personalized recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
