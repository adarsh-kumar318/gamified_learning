const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  room:         { type: String, required: true, unique: true },
  player1:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  player2:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  player1Score: { type: Number, default: 0 },
  player2Score: { type: Number, default: 0 },
  player1Time:  { type: Number, default: 0 }, // Total seconds taken
  player2Time:  { type: Number, default: 0 },
  winner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  xpInvested:  { type: Number, default: 50 },
  status:       { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  questions:    [Object], // Array of the 5 questions used
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
