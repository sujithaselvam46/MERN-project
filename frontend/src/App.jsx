// 
import React from 'react';
import ResumeUploader from './components/ResumeUploader';
import './index.css'

const App = () => {
  return (
    <div className="app-container">
      <div className='head'>
      {/* <h1 >AI Resume Analyzer</h1> */}
      </div>
      <ResumeUploader />
    </div>
  );
};

export default App;
