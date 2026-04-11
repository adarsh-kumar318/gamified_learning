const mongoose = require('mongoose');

const userHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  seenQuests: [{
    questId: String,
    topics: [String],
    lastAttempt: Date
  }],
  accuracyPerType: {
    webdev: { type: Number, default: 0 },
    aptitude: { type: Number, default: 0 },
    english: { type: Number, default: 0 },
    datascience: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserHistory', userHistorySchema);
