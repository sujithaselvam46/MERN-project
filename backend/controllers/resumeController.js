const fs = require("fs");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
const Resume = require("../models/Resume");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.analyzeResume = async (req, res) => {
  try {
    console.log("\n========== RESUME UPLOAD START ==========");
    console.log("Request received at:", new Date().toISOString());
    console.log("User ID:", req.userId);
    console.log("Body:", req.body);
    console.log("File info:", req.file ? { originalname: req.file.originalname, size: req.file.size } : "NO FILE");

    if (!req.file) {
      console.error("ERROR: No file provided");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { jobRole } = req.body;
    
    if (!jobRole) {
      console.error("ERROR: No job role provided");
      return res.status(400).json({ error: "Job role is required" });
    }

    console.log("Job Role:", jobRole);

    // Use the buffer directly from multipart upload
    const dataBuffer = req.file.buffer;
    if (!dataBuffer) {
      console.error("ERROR: No buffer in file");
      return res.status(400).json({ error: "File buffer is empty" });
    }
    
    console.log("File buffer size:", dataBuffer.length, "bytes");
    
    console.log("Parsing PDF...");
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    
    console.log("PDF parsed successfully");
    console.log("Extracted text length:", text.length, "characters");
    
    if (!text || text.trim().length === 0) {
      console.error("ERROR: No text extracted from PDF");
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }
    //  ADDED — Detect Aadhar, PAN, Certificates, Marksheet, invoices, etc.
    const badKeywords = [
      // Govt ID documents
      "aadhar",
      "aadhaar",
      "pan",
      "passport",

      // Other common non-resume docs
      "invoice",
      "marksheet",
      "hall ticket",
    ];

    const resumeIndicators = [
      "experience",
      "education",
      "projects",
      "skills",
      "summary",
      "objective",
      "contact",
      "achievements",
      "certifications",
      "work experience",
      "professional experience",
    ];

    const lower = text.toLowerCase();
    const hasBadKeywords = badKeywords.some((k) => lower.includes(k));
    const hasResumeIndicators = resumeIndicators.some((k) => lower.includes(k));

    // If the document doesn't look like a resume at all, reject it.
    // If it contains resume indicators but also has a few bad keywords (e.g., mentions a certificate), we allow analysis but warn the user.
    if (!hasResumeIndicators) {
      return res.status(400).json({
        error: `⚠️ Invalid File: ${req.file.filename}\nThis PDF does not appear to be a resume. Please upload a valid resume.`
      });
    }

    const warnings = [];

    if (hasBadKeywords) {
      warnings.push(
        "This file contains words commonly found in non-resume documents (e.g. invoice, mark sheet). If this is a resume, you may ignore this warning."
      );
    }

    // Add any backend-generated warnings to the response later.
    // 🟦 END OF ADDED CODE
    // Simple copy-paste detection
    const sentences = text.split(/[.?!]\s/);
    const sentenceSet = new Set();
    let hasDuplicate = false;
    for (let sentence of sentences) {
      sentence = sentence.trim();
      if (!sentence) continue;
      if (sentenceSet.has(sentence.toLowerCase())) {
        hasDuplicate = true;
        break;
      }
      sentenceSet.add(sentence.toLowerCase());
    }

    // AI analysis
    let prompt = `You are an expert recruiter. Analyze this resume for the job role: ${jobRole}.
Include:
1. Summary
2. Skills
3. Experience
4. Education
5. Strengths
6. Weakness
7. Validation score out of 10 (how suitable the resume is for the job role)

Resume text: ${text}`;

    if (hasDuplicate) {
      warnings.push(
        "The resume appears to contain duplicated or repetitive sentences. This may impact the quality of the analysis."
      );
      prompt += "\n⚠️ Note: The resume may contain copied or repetitive content.";
    }

    console.log("Calling Groq API with model: llama-3.1-8b-instant");
    console.log("Prompt length:", prompt.length, "characters");
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    console.log("Groq API response received");
    const result = completion.choices[0].message.content;
    console.log("Analysis result length:", result.length, "characters");

    // Save to DB with user ID
    const userId = req.userId || 'anonymous';
    console.log("Saving to database - User:", userId, "File:", req.file.originalname);
    
    const savedResume = await Resume.create({
      userId,
      filename: req.file.originalname,
      textContent: text,
      analysis: result,
      jobRole,
    });

    console.log("Resume saved successfully - ID:", savedResume._id);
    console.log("========== RESUME UPLOAD SUCCESS ==========\n");
    res.json({ success: true, analysis: result, saved: savedResume, warnings });

  } catch (err) {
    console.error("\n========== RESUME UPLOAD ERROR ==========");
    console.error("Error Type:", err.constructor.name);
    console.error("Error Message:", err.message);
    console.error("Error Stack:", err.stack);
    if (err.response?.status) {
      console.error("API Response Status:", err.response.status);
      console.error("API Response Data:", err.response.data);
    }
    console.error("========== END ERROR ==========\n");
    
    res.status(500).json({ 
      error: "Resume analysis failed",
      details: err.message 
    });
  }
};

// -----------------------------
// 2. Get All Resumes Function
// -----------------------------
exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ uploadedAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error("Error fetching resumes:", err);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
};
