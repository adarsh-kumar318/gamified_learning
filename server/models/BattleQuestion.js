const mongoose = require('mongoose');

const battleQuestionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    enum: ['Agentic AI', 'DSA', 'Mathematics', 'Science'],
    index: true,
  },
  topic: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
    unique: true,
  },
  options: {
    type: [String],
    validate: [arr => arr.length === 4, 'Must have exactly 4 options'],
  },
  correctAnswer: {
    type: Number, // 0-indexed position in options[]
    required: true,
    min: 0, max: 3,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true,
  },
  explanation: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Compound index for fast subject+difficulty queries
battleQuestionSchema.index({ subject: 1, difficulty: 1 });

module.exports = mongoose.model('BattleQuestion', battleQuestionSchema);
