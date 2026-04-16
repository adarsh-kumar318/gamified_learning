// models/Battle.js
const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  inviteCode:  { type: String, unique: true, required: true },
  type:        { type: String, enum: ['1v1', 'team'], default: '1v1' },
  category:    { type: String, required: true },
  status:      { type: String, enum: ['waiting', 'active', 'finished', 'cancelled'], default: 'waiting' },

  creator:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opponent:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  creatorScore:   { type: Number, default: 0 },
  opponentScore:  { type: Number, default: 0 },

  winner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  winnerId:    { type: String, default: null },

  questions:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
  startedAt:   { type: Date },
  endedAt:     { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Battle', battleSchema);
