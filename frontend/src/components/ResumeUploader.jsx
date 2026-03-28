import React, { useState } from 'react';
import axios from 'axios';
import './index.css'
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
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Correct file handler (ONLY this needed)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
   
    if (!file) return alert('Please select a PDF file.');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobRole', jobRole);

    setLoading(true);
    setAnalysis('');
    setWarnings([]);

    try {
      const token = localStorage.getItem("token");
      if(!token){
        alert("user not logged in")
        return
      }
      const response = await axios.post(
        'http://localhost:5000/api/resume/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data',   "Authorization": `Bearer ${token}` } }
      );

      // Backend returns an error → show alert
      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      // Show any warnings from the backend (e.g., document may not look like a resume)
      setWarnings(response.data.warnings || []);

      // Normal success
      if (response.data.analysis) {
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

      <div className='jobRole'>
        <label>JOB ROLE : </label>
        <select value={jobRole} onChange={e => setJobRole(e.target.value)}>
          {jobRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div className='progress'>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Analyzing...' : 'Upload & Analyze'}
        </button>
      </div>

      <div className="final">
        {warnings.length > 0 && (
          <div className="analysis-warning">
            <h2>⚠️ Warnings</h2>
            <ul>
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis && (
          <div className="analysis-result">
            <h2>AI Analysis & Validation Score:</h2>
            <div className="analysis-content">
              {analysis.split("\n").map((line, idx) => {
                const trimmed = line.trim();

                // Remove markdown-style markers and numbering (e.g. **1. Summary:**)
                const normalized = trimmed
                  .replace(/^\*+/, "")
                  .replace(/\*+$/, "")
                  .replace(/^\s*\d+[\.)]?\s*/, "")
                  .trim();

                const isHeading = /^(summary|skills|experience|education|strengths|weaknesses|validation score)/i.test(normalized);

                return (
                  <div className='box'>
                  <p
                    key={idx}
                    className={isHeading ? "analysis-line-heading" : "analysis-line"}
                  >
                    {normalized}
                  </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;