import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import './register.css'

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        email,
        password
      });

      console.log("Register response:", res.data);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Register error:", err);
      
      // Handle different error formats
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.response?.statusText) {
        errorMessage = err.response.statusText;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Create Account</h1>
            <p>Join our AI Resume Analyzer</p>
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✅ {success}</div>}

          <form className="register-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="register-footer">
            <p>Already have an account?</p>
            <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;