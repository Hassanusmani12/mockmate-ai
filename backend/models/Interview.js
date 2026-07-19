const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  score: { type: Number, default: null },
  feedback: { type: String, default: '' },
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  company: { type: String, default: '' },
  experienceLevel: { type: String, enum: ['junior', 'mid', 'senior', 'lead'], default: 'mid' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  language: { type: String, default: 'English' },
  mode: { type: String, enum: ['learning', 'mock'], default: 'learning' },
  questions: [questionSchema],
  overallScore: { type: Number, default: null },
  technicalScore: { type: Number, default: null },
  communicationScore: { type: Number, default: null },
  confidenceScore: { type: Number, default: null },
  problemSolvingScore: { type: Number, default: null },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  suggestions: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
