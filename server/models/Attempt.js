const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  questId: { 
    type: String, 
    required: true 
  },
  attemptNumber: { 
    type: Number, 
    default: 1 
  },
  questions: [{
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    xpReward: { type: Number, default: 20 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' }
  }],
  currentQuestionIndex: { 
    type: Number, 
    default: 0 
  },
  answers: [{
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean,
    timestamp: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['active', 'completed', 'failed'], 
    default: 'active' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
