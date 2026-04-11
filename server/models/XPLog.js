// models/XPLog.js — Audit trail of all XP events
const mongoose = require('mongoose');

const xpLogSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:   { type: Number, required: true },
  source:   { type: String, enum: ['quest', 'battle', 'streak', 'bonus'], required: true },
  sourceId: { type: String },   // quest ID, battle ID, etc.
  note:     { type: String },
}, { timestamps: true });

module.exports = mongoose.model('XPLog', xpLogSchema);
