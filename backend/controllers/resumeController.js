const fs = require("fs");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
const Resume = require("../models/Resume");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { jobRole } = req.body;

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    // 🟦 ADDED — Detect Aadhar, PAN, Certificates, Marksheet, invoices, etc.
    const badKeywords = [ 
      //Govt Id
      "aadhar", "aadhaar", "pan","passport",

      //certificates
  // "certificate", "certification",
  // "completion", "awarded", "training",
  // "course", "participation", "grade",
  "marksheet", "invoice", "hall ticket",
  
  //IBM certificate patterns
  "ibm","skillsbuild","digital credential","verified badge","issued by ibm","credential id","learning hours","professional certificate","badge","achievement"]
  ;
    const resumeIndicators = ["experience", "education", "projects", "skills"];

    const lower = text.toLowerCase();

    if (badKeywords.some((k) => lower.includes(k))) {
      return res.status(400).json({
        error: `❌ Invalid File: ${req.file.filename}\nThis PDF appears to be an Aadhaar card, PAN card, certificate, invoice, or other NON-resume document.`
      });
    }

    if (!resumeIndicators.some((k) => lower.includes(k))) {
      return res.status(400).json({
        error: `⚠️ Invalid File: ${req.file.filename}\nThis PDF does not appear to be a resume. Please upload a valid resume.`
      });
    }
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
6. Weaknesses
7. Validation score out of 10 (how suitable the resume is for the job role)

Resume text: ${text}`;

    if (hasDuplicate) {
      prompt += "\n⚠️ Note: The resume may contain copied or repetitive content.";
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    const result = completion.choices[0].message.content;

    // Save to DB
    const savedResume = await Resume.create({
      filename: req.file.filename,
      textContent: text,
      analysis: result,
      jobRole,
    });

    res.json({ success: true, analysis: result, saved: savedResume });

  } catch (err) {
    console.error("Error analyzing resume:", err);
    res.status(500).json({ error: "Resume analysis failed" });
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
