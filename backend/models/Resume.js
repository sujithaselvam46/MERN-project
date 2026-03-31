const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: { type: String, default: 'anonymous' },
  filename: { type: String, required: true },
  textContent: { type: String, required: true },
  analysis: { type: String },
  jobRole: { type: String },
  // copyPasteScore: { type: Number },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Resume", resumeSchema);
