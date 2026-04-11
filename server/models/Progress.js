const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questId:            { type: String, required: true },
  currentQuestionIndex: { type: Number, default: 0 },
  answers: [{
    questionIndex: { type: Number, required: true },
    selectedOption: { type: Number, required: true }
  }],
  shuffledQuestions: [{
    originalIndex: { type: Number, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswerIndex: { type: Number, required: true } // Mapped to the shuffled position
  }],
  isCompleted:       { type: Boolean, default: false },
  percentage:         { type: Number, default: 0 },
  score:              { type: Number, default: 0 },
  lastPlayedAt:       { type: Date,   default: Date.now }
}, { timestamps: true });

// Ensure unique progress per user per quest
progressSchema.index({ userId: 1, questId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
