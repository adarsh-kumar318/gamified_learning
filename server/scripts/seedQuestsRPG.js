require('dotenv').config();
const mongoose = require('mongoose');
const Quest    = require('../models/Quest');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leveluplearning';

const generateQuestions = (path, questLevel, count = 5) => {
  const questions = [];
  for (let i = 1; i <= count; i++) {
    const correctIdx = Math.floor(Math.random() * 4);
    
    const templates = [
      ["Advanced Architecture", "Legacy Support", "Cloud Security", "Real-time Optimization"],
      ["Frontend Mastery", "Backend Logic", "Fullstack Integration", "API Design"],
      ["Data Integrity", "Parallel Processing", "Algorithm Efficiency", "Memory Management"],
      ["User Experience", "Visual Design", "Accessibility", "Responsive Layouts"]
    ];
    
    const set = templates[i % templates.length];
    const finalOptions = set.map((text, idx) => `Choice ${idx + 1}: ${text} in ${path}`);

    questions.push({
      question: `[${path.toUpperCase()} - Phase ${questLevel}] Quest ${i}: Identify the optimal strategy for ${path} in this tier.`,
      options: finalOptions,
      correctAnswer: correctIdx,
      xpReward: i === 5 ? 100 : 20, // Final question of level gives more
      explanation: `Core principles of ${path} demand mastery of ${finalOptions[correctIdx].split(': ')[1]}.`
    });
  }
  return questions;
};

const seedQuests = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Cinematic RPG Seeding... 🧬');

    await Quest.deleteMany({});

    const paths = ['webdev', 'aptitude', 'english', 'datascience'];
    const totalLevelsPerPath = 50;

    const quests = [];

    paths.forEach(path => {
      for (let lvl = 1; lvl <= totalLevelsPerPath; lvl++) {
        const isBoss = lvl % 5 === 0;
        quests.push({
          id: `${path}_lvl_${lvl}`,
          title: isBoss ? `BOSS: ${path.toUpperCase()} GUARDIAN` : `${path.toUpperCase()} TRIAL: LEVEL ${lvl}`,
          level: lvl,
          pathId: path,
          type: path,
          description: isBoss 
            ? "A legendary guardian blocks your path. Defeat them to unlock the next region!" 
            : `Prove your skills in ${path} and advance along the mystical road.`,
          questions: generateQuestions(path, lvl, 5),
          isBoss
        });
      }
    });

    await Quest.insertMany(quests);
    console.log(`✅ Successfully seeded ${quests.length} Quests (5 questions each).`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedQuests();
