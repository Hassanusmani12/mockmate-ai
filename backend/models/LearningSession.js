const mongoose = require('mongoose');

const learningSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  company: { type: String, default: '' },
  experienceLevel: { type: String, enum: ['junior', 'mid', 'senior', 'lead'], default: 'mid' },
  currentTopic: { type: String, default: '' },
  completedTopics: [{ type: String }],
  chatHistory: [{ role: String, content: String }],
}, { timestamps: true });

module.exports = mongoose.model('LearningSession', learningSessionSchema);
