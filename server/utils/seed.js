// utils/seed.js — Seeds all 20 quest documents into MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const Quest    = require('../models/Quest');

const QUESTS = [
  // ──── Web Dev ────
  { id:'w1', title:'The HTML Shrine',    category:'webdev', difficulty:'easy',   level:1, xp:100, coins:50,  desc:'Master the sacred texts of HTML structure.',
    question:{ question:'Which HTML tag is used to create the largest heading?', options:['<h6>','<header>','<h1>','<heading>'], answer:2, explanation:'<h1> is the largest heading tag, going down to <h6> for the smallest.', topic:'HTML Basics' } },
  { id:'w2', title:'CSS Enchantments',   category:'webdev', difficulty:'easy',   level:2, xp:150, coins:75,  desc:'Wield the power of styles and cascades.',
    question:{ question:'Which CSS property controls the text color?', options:['font-color','text-color','color','foreground'], answer:2, explanation:"The 'color' property sets the foreground color of text in CSS.", topic:'CSS Fundamentals' } },
  { id:'w3', title:'JavaScript Spells',  category:'webdev', difficulty:'medium', level:3, xp:200, coins:100, desc:'Learn to cast dynamic spells on the DOM.',
    question:{ question:'Which method selects an element by its ID?', options:['getElement()','getElementById()','selectById()','queryId()'], answer:1, explanation:'document.getElementById() returns a reference to the element with the matching ID.', topic:'JavaScript DOM' } },
  { id:'w4', title:'Flexbox Fortress',   category:'webdev', difficulty:'medium', level:4, xp:250, coins:125, desc:'Build powerful layouts with Flexbox.',
    question:{ question:"What does 'justify-content: center' do in Flexbox?", options:['Centers items vertically','Adds padding','Centers items horizontally','Stretches items'], answer:2, explanation:'In a row-direction flex container, justify-content controls horizontal alignment.', topic:'CSS Flexbox' } },
  { id:'w5', title:'React Realm',        category:'webdev', difficulty:'hard',   level:5, xp:300, coins:150, desc:'Unlock the secrets of component-based design.',
    question:{ question:'What hook is used to manage state in a React function component?', options:['useEffect','useContext','useRef','useState'], answer:3, explanation:'useState is the primary hook for adding state to functional React components.', topic:'React Hooks' } },

  // ──── Aptitude ────
  { id:'a1', title:'Number Nexus',       category:'aptitude', difficulty:'easy',   level:1, xp:100, coins:50,  desc:'Command the ancient powers of arithmetic.',
    question:{ question:'What is 15% of 200?', options:['25','30','35','20'], answer:1, explanation:'15% of 200 = (15/100) × 200 = 30.', topic:'Percentages' } },
  { id:'a2', title:'Logic Labyrinth',    category:'aptitude', difficulty:'easy',   level:2, xp:150, coins:75,  desc:'Navigate the maze of logical deduction.',
    question:{ question:'All roses are flowers. All flowers need water. Therefore:', options:['Some roses need water','All roses need water','No roses need water','Roses don\'t need water'], answer:1, explanation:'This is a classic syllogism: if A→B and B→C, then A→C.', topic:'Logical Reasoning' } },
  { id:'a3', title:'Pattern Portal',     category:'aptitude', difficulty:'medium', level:3, xp:200, coins:100, desc:'Discover the hidden patterns of the universe.',
    question:{ question:'What comes next? 2, 4, 8, 16, ___', options:['24','30','32','20'], answer:2, explanation:'Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32.', topic:'Number Series' } },
  { id:'a4', title:'Probability Peak',   category:'aptitude', difficulty:'medium', level:4, xp:250, coins:125, desc:'Master the art of chance and prediction.',
    question:{ question:'A bag has 3 red and 2 blue balls. Probability of picking red?', options:['2/5','1/2','3/5','1/3'], answer:2, explanation:'3 red out of 5 total = 3/5 probability.', topic:'Probability' } },
  { id:'a5', title:'Algebra Abyss',      category:'aptitude', difficulty:'hard',   level:5, xp:300, coins:150, desc:'Solve the ultimate algebraic riddles.',
    question:{ question:'If 2x + 3 = 11, what is x?', options:['3','4','5','7'], answer:1, explanation:'2x = 11-3 = 8, so x = 8/2 = 4.', topic:'Algebra' } },

  // ──── English ────
  { id:'e1', title:'Grammar Grotto',     category:'english', difficulty:'easy',   level:1, xp:100, coins:50,  desc:'Explore the foundations of language.',
    question:{ question:'Which sentence is grammatically correct?', options:['Him and me went to the store','He and I went to the store','Him and I went to the store','He and me went to the store'], answer:1, explanation:'Subject pronouns (He, I) are used for the subject of a sentence.', topic:'Grammar' } },
  { id:'e2', title:'Vocabulary Vault',   category:'english', difficulty:'easy',   level:2, xp:150, coins:75,  desc:'Unlock the treasure trove of words.',
    question:{ question:"What is the meaning of 'ephemeral'?", options:['Permanent','Lasting a very short time','Ancient','Beautiful'], answer:1, explanation:"Ephemeral means lasting for a very short time.", topic:'Vocabulary' } },
  { id:'e3', title:'Synonym Sanctum',    category:'english', difficulty:'medium', level:3, xp:200, coins:100, desc:'Master the art of word equivalence.',
    question:{ question:"Choose the best synonym for 'meticulous':", options:['Careless','Extremely careful','Hasty','Indifferent'], answer:1, explanation:'Meticulous means showing great attention to detail.', topic:'Synonyms' } },
  { id:'e4', title:'Reading Realm',      category:'english', difficulty:'medium', level:4, xp:250, coins:125, desc:'Decode the secrets within text.',
    question:{ question:"What is the main purpose of a 'thesis statement'?", options:['End a paragraph','Start a story','State the main argument','List examples'], answer:2, explanation:'A thesis statement presents the central argument or main point.', topic:'Writing' } },
  { id:'e5', title:'Idiom Isle',         category:'english', difficulty:'hard',   level:5, xp:300, coins:150, desc:'Unravel the mysteries of figurative language.',
    question:{ question:"What does 'bite the bullet' mean?", options:['Eat metal','Endure pain or difficulty','Shoot a gun','Be very hungry'], answer:1, explanation:"To 'bite the bullet' means to endure a painful situation.", topic:'Idioms' } },

  // ──── Data Science ────
  { id:'d1', title:'Data Dungeon',       category:'datascience', difficulty:'easy',   level:1, xp:100, coins:50,  desc:'Enter the world of raw data.',
    question:{ question:'What is the output of: print(type(5.0)) in Python?', options:["<class 'int'>","<class 'num'>","<class 'float'>","<class 'double'>"], answer:2, explanation:"5.0 is a floating-point number, so Python identifies it as <class 'float'>.", topic:'Python Basics' } },
  { id:'d2', title:'Statistics Spire',   category:'datascience', difficulty:'easy',   level:2, xp:150, coins:75,  desc:'Scale the heights of statistical knowledge.',
    question:{ question:'What is the median of: 3, 7, 1, 9, 4?', options:['4','5','4.8','7'], answer:0, explanation:'Sorted: 1,3,4,7,9. The middle value (3rd of 5) is 4.', topic:'Statistics' } },
  { id:'d3', title:'Pandas Peaks',       category:'datascience', difficulty:'medium', level:3, xp:200, coins:100, desc:'Tame the powerful Pandas library.',
    question:{ question:'Which Pandas method displays the first 5 rows of a DataFrame?', options:['df.top()','df.first()','df.head()','df.show()'], answer:2, explanation:'df.head() returns the first n rows (default 5) of a DataFrame.', topic:'Pandas' } },
  { id:'d4', title:'ML Mountain',        category:'datascience', difficulty:'medium', level:4, xp:250, coins:125, desc:'Ascend to the peak of machine learning.',
    question:{ question:'Which algorithm is used for classification with a straight-line boundary?', options:['K-Means','Linear Regression','Logistic Regression','DBSCAN'], answer:2, explanation:'Logistic Regression is a classification algorithm that uses a linear decision boundary.', topic:'ML Basics' } },
  { id:'d5', title:'Neural Nexus',       category:'datascience', difficulty:'hard',   level:5, xp:300, coins:150, desc:'Unlock the power of neural networks.',
    question:{ question:"What is the role of an 'activation function' in a neural network?", options:['Store weights','Train the model','Introduce non-linearity','Normalize data'], answer:2, explanation:'Activation functions introduce non-linearity, allowing networks to learn complex patterns.', topic:'Deep Learning' } },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const q of QUESTS) {
      await Quest.findOneAndUpdate({ id: q.id }, q, { upsert: true, new: true });
      console.log(`  ✓ ${q.id} — ${q.title}`);
    }

    console.log(`\n🌱 Seeded ${QUESTS.length} quests successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
