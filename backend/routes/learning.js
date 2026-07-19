const express = require('express');
const router = express.Router();
const {
  start,
  message,
  nextTopic,
  repeat,
  hint,
} = require('../controllers/learningController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, start);
router.post('/message', protect, message);
router.post('/next-topic', protect, nextTopic);
router.post('/repeat', protect, repeat);
router.post('/hint', protect, hint);

module.exports = router;
