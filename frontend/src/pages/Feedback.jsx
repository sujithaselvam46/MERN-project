
import React, { useState } from "react";
import axios from "axios";
import './feedback.css'

const Feedback = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!message.trim()) {
      setError("Please write some feedback");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/feedback", 
        { message },
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      
      setSuccess(true);
      setMessage("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-wrapper">
      <div className="feedback-container">
        <div className="feedback-card glass-card-large">
          <div className="feedback-header">
            <h1>Share Your Feedback</h1>
            <p>Help us improve the AI Resume Analyzer</p>
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✅ Thank you for your feedback!</div>}

          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="feedback">Your Feedback</label>
              <textarea
                id="feedback"
                className="feedback-textarea"
                placeholder="Tell us what you think about our AI Resume Analyzer..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="8"
              />
              <p className="char-count">{message.length} characters</p>
            </div>

            <button 
              type="submit" 
              className="feedback-button" 
              disabled={loading || !message.trim()}
            >
              {loading ? "Submitting..." : "Send Feedback"}
            </button>
          </form>

          <div className="feedback-tips">
            <h3>📝 Tips for Better Feedback</h3>
            <ul>
              <li>Be specific about your experience</li>
              <li>Mention what worked well</li>
              <li>Suggest improvements</li>
              <li>Share feature requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;