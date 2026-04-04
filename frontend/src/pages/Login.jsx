import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import './login.css'

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", { email, password: "***" });
      
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      console.log("Login response status:", res.status);
      console.log("Login response data:", res.data);

      if (res.data.token && res.data.username) {
        // Store token and username
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        
        console.log("Login successful, redirecting...");
        // Redirect to dashboard
        navigate("/home");
      } else {
        console.warn("Response missing token or username:", res.data);
        setError("Invalid response from server - missing token or username");
      }
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      
      // Handle different error formats
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.response?.statusText) {
        errorMessage = err.response.statusText;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error("Final error message:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          <form className="login-form" onSubmit={handleLogin}>
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

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account?</p>
            <Link to="/register">Create one here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;