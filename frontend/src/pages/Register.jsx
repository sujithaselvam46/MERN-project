import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";   // ✅ FIXED IMPORT
import './register.css'
const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();  // ✅ Now it will work

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username,
        email,
        password
      });

      alert("Registered successfully");

      navigate("/login"); // redirect after register
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <>
    <div className="register-container">
      <div style={{ textAlign: "center", color: "white", marginTop: "100px" }}>
        <div className="register-content">
        <h2>Registeration Form</h2>
         <div className="register-data">
        <label>Username:</label><br></br>
        <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <br /><br />

       <label id="special">Email:</label><br></br> <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <br /><br />

      <label>Password:</label><br></br>  <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />
        
        
        <br></br>
        <button className="btn" onClick={handleRegister}>Register</button>
      </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default Register;