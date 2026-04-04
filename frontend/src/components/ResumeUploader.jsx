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

    console.log("Upload starting...");
    console.log("File name:", file.name);
    console.log("File size:", file.size, "bytes");
    console.log("Job role:", jobRole);

    setLoading(true);
    setAnalysis('');
    setWarnings([]);

    try {
      const token = localStorage.getItem("token");
      console.log("Token found:", token ? "Yes" : "No");
      
      if(!token){
        alert("user not logged in")
        setLoading(false);
        return
      }
      
      console.log("Sending request to backend...");
      const response = await axios.post(
         'http://localhost:5000/api/resume/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data',   "Authorization": `Bearer ${token}` } }
      );

      console.log("Response received:", response.status);
      console.log("Response data:", response.data);

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
        console.log("Analysis displayed successfully");
      } else {
        setAnalysis("⚠️ No analysis returned from server.");
      }

    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response status:", error.response?.status);
      console.error("Error response data:", error.response?.data);
      console.error("Error message:", error.message);

      let errorMsg = "Upload failed. Try again.";
      
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMsg = error.response.data.details;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      console.error("Final error message shown to user:", errorMsg);
      alert(errorMsg);

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
            <h2 className="analysis-main-heading">AI Analysis & Validation Score</h2>
            <div className="analysis-content">
              {(() => {
                const lines = analysis
                  .split("\n")
                  .map(line => line.trim())
                  .filter(line => line.length > 0);

                const sections = [];
                const extractScore = (text) => {
                  if (!text) return null;
                  // Look for patterns like "8/10", "80/100", "8", "80" 
                  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+))?/);
                  if (match) {
                    const score = parseFloat(match[1]);
                    const maxScore = match[2] ? parseFloat(match[2]) : null;
                    
                    // If out of 10, convert to 100
                    if (maxScore && maxScore === 10) {
                      return (score / 10 * 100).toString();
                    }
                    // If score is between 0-10, assume it's out of 10
                    if (!maxScore && score <= 10) {
                      return (score * 10).toString();
                    }
                    return score.toString();
                  }
                  return null;
                };

                lines.forEach(line => {
                  const normalized = line
                    .replace(/^\*+/, "")
                    .replace(/\*+$/, "")
                    .replace(/^\s*\d+[\.)]?\s*/, "")
                    .trim();

                  const headingMatch = normalized.match(/^(summary|skills|experience|education|strength|strengths|weakness|weaknesses|recommendation|recommendations|improvement|improvements|validation score)(?:\s*\(([^)]*)\)|\s+(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?))?(?:[^:]*)?:?\s*(.*)$/i);

                  if (headingMatch) {
                    const headingName = headingMatch[1].trim();
                    const headingScoreText = headingMatch[2] ? headingMatch[2].trim() : (headingMatch[3] ? headingMatch[3].trim() : "");
                    const extraText = headingMatch[4] ? headingMatch[4].trim() : "";
                    const section = { heading: headingName, items: [], score: null };

                    if (/validation\s*score/i.test(headingName)) {
                      section.score = extractScore(headingScoreText) || extractScore(extraText);
                    } else if (extraText) {
                      section.items.push(extraText);
                    }

                    sections.push(section);
                  } else {
                    if (sections.length === 0) {
                      sections.push({ heading: null, items: [], score: null });
                    }

                    const currentSection = sections[sections.length - 1];
                    const itemText = normalized;

                    if (/validation\s*score/i.test(currentSection.heading || "")) {
                      if (!currentSection.score) {
                        currentSection.score = extractScore(itemText);
                      }
                    } else {
                      currentSection.items.push(itemText);
                    }
                  }
                });

                // Merge sections
                const mergedSections = [];
                sections.forEach((section) => {
                  const key = section.heading?.toLowerCase().trim();
                  if (!key) {
                    mergedSections.push(section);
                    return;
                  }

                  const existing = mergedSections.find(s => s.heading?.toLowerCase().trim() === key);
                  if (existing && !/validation\s*score/i.test(key)) {
                    existing.items.push(...section.items);
                    if (!existing.score && section.score) existing.score = section.score;
                  } else {
                    mergedSections.push(section);
                  }
                });

                // Find main sections (Summary, Skills, Experience) - first 3 points
                const mainSectionHeadings = ['summary', 'skills', 'experience', 'education', 'strength', 'weakness'];
                const mainPoints = [];
                const otherSections = [];
                let scoreValue = 0;

                mergedSections.forEach(section => {
                  const heading = section.heading?.toLowerCase().trim() || '';
                  if (/validation\s*score/i.test(heading)) {
                    // Try to extract score from section.score first
                    if (section.score) {
                      scoreValue = parseInt(section.score) || 0;
                    } else if (section.items.length > 0) {
                      // Try to extract from items if score wasn't captured in heading
                      const joinedItems = section.items.join(' ');
                      const scoreMatch = joinedItems.match(/(\d+)\s*(?:\/\s*(10|100))?/);
                      if (scoreMatch) {
                        let score = parseInt(scoreMatch[1]);
                        const maxScore = scoreMatch[2] ? parseInt(scoreMatch[2]) : null;
                        // Convert 0-10 scale to 0-100
                        if (maxScore === 10 || (!maxScore && score <= 10)) {
                          score = score * 10;
                        }
                        scoreValue = score;
                      }
                    }
                    console.log("Found validation score:", scoreValue, "from heading:", heading);
                  } else if (mainSectionHeadings.some(h => heading.includes(h)) && mainPoints.length < 3) {
                    mainPoints.push(section);
                  } else {
                    otherSections.push(section);
                  }
                });

                // Split main points into max 2-3 lines each
                const formatPointItems = (items, maxLines = 3) => {
                  if (items.length === 0) return [];
                  const joinedText = items.join(' ');
                  const sentences = joinedText.split(/(?<=[.!?])\s+/).filter(Boolean);
                  
                  const result = [];
                  let currentLine = '';
                  
                  sentences.forEach(sentence => {
                    if (result.length >= maxLines) return;
                    if ((currentLine + ' ' + sentence).length > 150) {
                      if (currentLine) result.push(currentLine.trim());
                      currentLine = sentence;
                    } else {
                      currentLine += (currentLine ? ' ' : '') + sentence;
                    }
                  });
                  
                  if (currentLine && result.length < maxLines) {
                    result.push(currentLine.trim());
                  }
                  
                  return result.slice(0, maxLines);
                };

                // Render main 3 points
                const mainPointsRender = mainPoints.map((section, idx) => (
                  <div key={`main-${idx}`} className="main-point-card">
                    <h3 className="point-heading">{section.heading}</h3>
                    <div className="point-content">
                      {formatPointItems(section.items, 3).map((line, lineIdx) => (
                        <p key={lineIdx} className="point-line">{line}</p>
                      ))}
                    </div>
                  </div>
                ));

                // Render validation score with ring animation
                const validationRender = (
                  <div className="validation-score-card">
                    <div className="score-ring-wrapper">
                      <svg className="score-ring" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#38BDF8" />
                            <stop offset="50%" stopColor="#667eea" />
                            <stop offset="100%" stopColor="#f093fb" />
                          </linearGradient>
                        </defs>
                        <circle cx="60" cy="60" r="54" className="score-ring-bg" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <circle 
                          cx="60" 
                          cy="60" 
                          r="54" 
                          className={`score-ring-progress score-${Math.round(scoreValue)}`}
                          fill="none"
                          stroke="url(#scoreGradient)"
                          strokeWidth="8"
                          strokeDasharray={`${(scoreValue / 100) * 339.3} 339.3`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="score-text">
                        <span className="score-value">{scoreValue}</span>
                        <span className="score-label">/ 100</span>
                      </div>
                    </div>
                    <p className="validation-label">Validation Score</p>
                  </div>
                );

                // Render other sections (recommendations, improvements)
                const otherSectionsRender = otherSections.map((section, idx) => (
                  <div key={`other-${idx}`} className="other-section-card">
                    <h3 className="section-subheading">{section.heading}</h3>
                    <ul className="section-list">
                      {section.items.slice(0, 5).map((item, itemIdx) => (
                        <li key={itemIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ));

                return (
                  <>
                    {/* Main 3 Points */}
                    <div className="main-points-container">
                      {mainPointsRender}
                    </div>

                    {/* Validation Score */}
                    {validationRender}

                    {/* Recommendations & Improvements */}
                    <div className="other-sections-container">
                      {otherSectionsRender}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;