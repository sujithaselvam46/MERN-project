  const express = require("express");
  const router = express.Router();
  const multer = require("multer");
  const { analyzeResume, getAllResumes } = require("../controllers/resumeController");
  const authMiddleware=require("../middleware/authMiddleware")

  // Multer setup - Use memory storage for better performance
  const storage = multer.memoryStorage();

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/pdf") cb(null, true);
      else cb(new Error("Only PDF resumes are allowed"), false);
    }
  });

  // Routes
  // 1️⃣ Upload route with error handling
  router.post("/upload",authMiddleware, (req, res, next) => {
    const uploadSingle = upload.single("resume");

    uploadSingle(req, res, function (err) {
      if (err) {
        // Multer file type error
        console.error("Multer error:", err.message);
        return res.status(400).json({ error: err.message });
      }
      next(); // proceed to analyzeResume if file is valid
    });
  }, analyzeResume);
  router.get("/all", authMiddleware,getAllResumes); // must be a function

  module.exports = router;
