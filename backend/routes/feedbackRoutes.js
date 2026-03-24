
const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");

router.post("/", async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.json({ message: "Feedback submitted", feedback });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

module.exports = router;