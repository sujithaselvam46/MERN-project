
import React, { useState } from "react";
import axios from "axios";
import './feedback.css'
const Feedback = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/feedback", {
        message
      });
      alert("Feedback submitted");
    } catch {
      alert("Error");
    }
  };

  return (
    <div className="feedback-container">
    <div style={{ textAlign: "center", color: "white", marginTop: "100px" }}>
      <h2>Feedback</h2>
      <div className="feedback-content">
      <textarea placeholder="Type here.." onChange={e => setMessage(e.target.value)} />
      <br /><br />

      <button className="btn" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
    </div>
  );
};

export default Feedback;