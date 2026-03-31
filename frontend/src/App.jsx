import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './styles.css';

// Pages
import Welcome from "./pages/Welcome";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResumeUploader from "./components/ResumeUploader";
import Feedback from "./pages/Feedback";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Welcome/Home */}
        <Route path="/" element={<Welcome />} />

        {/* Auth Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/home"
          element={
            <DashboardLayout>
              <ResumeUploader />
            </DashboardLayout>
          }
        />
        <Route
          path="/feedback"
          element={
            <DashboardLayout>
              <Feedback />
            </DashboardLayout>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;