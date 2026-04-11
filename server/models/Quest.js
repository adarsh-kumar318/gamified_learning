const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question:      { type: String, required: true },
  options:       { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  xpReward:      { type: Number, default: 20 },
  explanation:   { type: String }
});

const questSchema = new mongoose.Schema({
  id:         { type: String, required: true, unique: true },
  title:      { type: String, required: true },
  level:      { type: Number, required: true },
  pathId:     { type: String, required: true },
  type:       { type: String, enum: ['webdev', 'aptitude', 'english', 'datascience'], required: true },
  description: { type: String },
  questions:   [questionSchema],
  isBoss:      { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);
