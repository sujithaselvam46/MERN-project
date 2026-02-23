import React, { useState } from 'react';
import axios from 'axios';

const jobRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Data Scientist",
  "UI/UX Designer",
  "MERN stack Developer"
];

const ResumeUploader = () => {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState(jobRoles[0]);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ FIXED — CLEAN FILE SELECT HANDLER
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile); // Keep only setting the file
  };

  // ✅ UPLOAD FUNCTION (UNCHANGED)
  const handleUpload = async () => {
    if (!file) return alert('Please select a PDF file.');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobRole', jobRole);

    setLoading(true);
    setAnalysis('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/resume/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      if (response.data && response.data.analysis) {
        setAnalysis(response.data.analysis);
      } else {
        setAnalysis("⚠️ No analysis returned from server.");
      }

    } catch (error) {
      console.error(error);

      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("Upload failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader-container">
      <h1>AI RESUME ANALYZER</h1>

      <div className="jobRole">
        <label>JOB ROLE : </label>
        <select value={jobRole} onChange={(e) => setJobRole(e.target.value)}>
          {jobRoles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div className="progress">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Analyzing...' : 'Upload & Analyze'}
        </button>
      </div>

      <div className="final">
        {analysis && (
          <div className="analysis-result">
            <h2>AI Analysis & Validation Score:</h2>
            <pre>{analysis}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;
