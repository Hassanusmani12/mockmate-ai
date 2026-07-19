const express = require('express');
const router = express.Router();
const {
  generateQuestions,
  submitAnswer,
  finishInterview,
  getHistory,
  getInterview,
  chat,
  startLearning,
  learn,
  deleteInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateQuestions);
router.post('/start-learning', protect, startLearning);
router.post('/learn', protect, learn);
router.post('/chat', protect, chat);
router.post('/answer', protect, submitAnswer);
router.post('/finish', protect, finishInterview);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getInterview);
router.delete('/:id', protect, deleteInterview);

module.exports = router;
