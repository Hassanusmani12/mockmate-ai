const express = require('express');
const router = express.Router();
const { uploadResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Max 10MB.' });
      }
      if (err.message === 'Only PDF files are allowed') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({
        message: 'File upload failed',
        detail: err.message,
        storageErrors: err.storageErrors || [],
      });
    }
    next();
  });
}, uploadResume);

module.exports = router;
