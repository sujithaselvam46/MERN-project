import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './login.css'
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ already correct

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      // ✅ store token
      localStorage.setItem("token", res.data.token);

      // ✅ redirect to main page
      navigate("/home");

    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div>
      <div className="login-container">
        <h2>Login form</h2>
        <div className="login-content">
        <div className="login-data">
     <label>Email:<br></br></label> <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <br /><br />
     <label>Password:<br></br></label> <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />
      <br /><br />
      <button className="btn" onClick={handleLogin}>Login</button>
    </div>
    </div>
    </div>
    </div>
  );
};

export default Login;