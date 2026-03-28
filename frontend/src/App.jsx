import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./pages/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResumeUploader from "./components/ResumeUploader";
import Feedback from "./pages/Feedback";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
       {/* Default Welcome Page */}
        <Route path="/" element={
          <div style={{ textAlign: "center", color: "white", marginTop: "100px" }}>
            <h1>✨Welcome to AI Resume Analyzer✨</h1>
            <h3> Smart • Accurate • AI-powered resume scoring </h3>
            <p>New User? please Register...</p>
            <p>Already have an account? please Login...</p>
          </div>
        } />
        <Route path="/register" element={<Register />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<ResumeUploader />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;