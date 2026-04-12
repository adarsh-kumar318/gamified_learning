export const AVATARS = [
  { id: 1, emoji: "🧙", name: "Wizard", color: "#7c3aed" },
  { id: 2, emoji: "🦊", name: "Fox", color: "#f97316" },
  { id: 3, emoji: "🐉", name: "Dragon", color: "#dc2626" },
  { id: 4, emoji: "🦁", name: "Lion", color: "#d97706" },
  { id: 5, emoji: "🐺", name: "Wolf", color: "#6366f1" },
  { id: 6, emoji: "🦋", name: "Phoenix", color: "#ec4899" },
  { id: 7, emoji: "⚔️", name: "Knight", color: "#64748b" },
  { id: 8, emoji: "🏹", name: "Archer", color: "#16a34a" },
];

export const SKILL_PATHS = [
  { id: "webdev", name: "Web Dev", icon: "Code", color: "#3b82f6", desc: "HTML, CSS, JavaScript & React" },
  { id: "aptitude", name: "Aptitude", icon: "Brain", color: "#8b5cf6", desc: "Math, Logic & Reasoning" },
  { id: "english", name: "English", icon: "Book", color: "#10b981", desc: "Grammar, Vocabulary & Writing" },
  { id: "datascience", name: "Data Science", icon: "Database", color: "#f59e0b", desc: "Python, Stats & ML Basics" },
  { id: "agenticai", name: "Agentic AI", icon: "Bot", color: "#ec4899", desc: "Autonomous Agents & LLM Frameworks" },
  { id: "dsa", name: "DSA", icon: "Network", color: "#f43f5e", desc: "Data Structures & Algorithm Mastery" },
  { id: "mathematics", name: "Mathematics", icon: "Calculator", color: "#fbbf24", desc: "Calculus, Linear Algebra & Theory" },
  { id: "chemistry", name: "Chemistry", icon: "FlaskConical", color: "#06b6d4", desc: "Organic, Inorganic & Lab Science" },
  { id: "physics", name: "Physics", icon: "Atom", color: "#8b5cf6", desc: "Mechanics, Quantum & Unified Laws" },
  { id: "others", name: "Others", icon: "Sparkles", color: "#a855f7", desc: "Summon Custom AI Trials" },
];

export const QUESTS = {
  webdev: [
    { id: "w1", title: "The HTML Shrine", level: 1, xp: 100, coins: 50, desc: "Master the sacred texts of HTML structure.", question: "Which HTML tag is used to create the largest heading?", options: ["<h6>","<header>","<h1>","<heading>"], answer: 2, explanation: "<h1> is the largest heading tag, going down to <h6> for the smallest.", topic: "HTML Basics" },
    { id: "w2", title: "CSS Enchantments", level: 2, xp: 150, coins: 75, desc: "Wield the power of styles and cascades.", question: "Which CSS property controls the text color?", options: ["font-color","text-color","color","foreground"], answer: 2, explanation: "The 'color' property sets the foreground color of text in CSS.", topic: "CSS Fundamentals" },
    { id: "w3", title: "JavaScript Spells", level: 3, xp: 200, coins: 100, desc: "Learn to cast dynamic spells on the DOM.", question: "Which method selects an element by its ID?", options: ["getElement()","getElementById()","selectById()","queryId()"], answer: 1, explanation: "document.getElementById() returns a reference to the element with the matching ID.", topic: "JavaScript DOM" },
    { id: "w4", title: "Flexbox Fortress", level: 4, xp: 250, coins: 125, desc: "Build powerful layouts with Flexbox.", question: "What does 'justify-content: center' do in Flexbox?", options: ["Centers items vertically","Adds padding","Centers items horizontally","Stretches items"], answer: 2, explanation: "In a row-direction flex container, justify-content controls horizontal alignment.", topic: "CSS Flexbox" },
    { id: "w5", title: "React Realm", level: 5, xp: 300, coins: 150, desc: "Unlock the secrets of component-based design.", question: "What hook is used to manage state in a React function component?", options: ["useEffect","useContext","useRef","useState"], answer: 3, explanation: "useState is the primary hook for adding state to functional React components.", topic: "React Hooks" },
  ],
  aptitude: [
    { id: "a1", title: "Number Nexus", level: 1, xp: 100, coins: 50, desc: "Command the ancient powers of arithmetic.", question: "What is 15% of 200?", options: ["25","30","35","20"], answer: 1, explanation: "15% of 200 = (15/100) × 200 = 30.", topic: "Percentages" },
    { id: "a2", title: "Logic Labyrinth", level: 2, xp: 150, coins: 75, desc: "Navigate the maze of logical deduction.", question: "All roses are flowers. All flowers need water. Therefore:", options: ["Some roses need water","All roses need water","No roses need water","Roses are flowers that don't need water"], answer: 1, explanation: "This is a classic syllogism: if A→B and B→C, then A→C.", topic: "Logical Reasoning" },
    { id: "a3", title: "Pattern Portal", level: 3, xp: 200, coins: 100, desc: "Discover the hidden patterns of the universe.", question: "What comes next? 2, 4, 8, 16, ___", options: ["24","30","32","20"], answer: 2, explanation: "Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32.", topic: "Number Series" },
    { id: "a4", title: "Probability Peak", level: 4, xp: 250, coins: 125, desc: "Master the art of chance and prediction.", question: "A bag has 3 red and 2 blue balls. Probability of picking red?", options: ["2/5","1/2","3/5","1/3"], answer: 2, explanation: "3 red out of 5 total = 3/5 probability.", topic: "Probability" },
    { id: "a5", title: "Algebra Abyss", level: 5, xp: 300, coins: 150, desc: "Solve the ultimate algebraic riddles.", question: "If 2x + 3 = 11, what is x?", options: ["3","4","5","7"], answer: 1, explanation: "2x = 11-3 = 8, so x = 8/2 = 4.", topic: "Algebra" },
  ],
  english: [
    { id: "e1", title: "Grammar Grotto", level: 1, xp: 100, coins: 50, desc: "Explore the foundations of language.", question: "Which sentence is grammatically correct?", options: ["Him and me went to the store","He and I went to the store","Him and i went to the store","He and me went to the store"], answer: 1, explanation: "Subject pronouns (He, I) are used for the subject of a sentence.", topic: "Grammar" },
    { id: "e2", title: "Vocabulary Vault", level: 2, xp: 150, coins: 75, desc: "Unlock the treasure trove of words.", question: "What is the meaning of 'ephemeral'?", options: ["Permanent","Lasting a very short time","Ancient","Beautiful"], answer: 1, explanation: "Ephemeral means lasting for a very short time (e.g., 'ephemeral trends').", topic: "Vocabulary" },
    { id: "e3", title: "Synonym Sanctum", level: 3, xp: 200, coins: 100, desc: "Master the art of word equivalence.", question: "Choose the best synonym for 'meticulous':", options: ["Careless","Extremely careful","Hasty","Indifferent"], answer: 1, explanation: "Meticulous means showing great attention to detail; careful and precise.", topic: "Synonyms" },
    { id: "e4", title: "Reading Realm", level: 4, xp: 250, coins: 125, desc: "Decode the secrets within text.", question: "What is the main purpose of a 'thesis statement'?", options: ["End a paragraph","Start a story","State the main argument","List examples"], answer: 2, explanation: "A thesis statement presents the central argument or main point of an essay.", topic: "Writing" },
    { id: "e5", title: "Idiom Isle", level: 5, xp: 300, coins: 150, desc: "Unravel the mysteries of figurative language.", question: "What does 'bite the bullet' mean?", options: ["Eat metal","Endure pain or difficulty","Shoot a gun","Be very hungry"], answer: 1, explanation: "To 'bite the bullet' means to endure a painful or unpleasant situation.", topic: "Idioms" },
  ],
  datascience: [
    { id: "d1", title: "Data Dungeon", level: 1, xp: 100, coins: 50, desc: "Enter the world of raw data.", question: "What is the output of: print(type(5.0)) in Python?", options: ["<class 'int'>","<class 'num'>","<class 'float'>","<class 'double'>"], answer: 2, explanation: "5.0 is a floating-point number, so Python identifies it as <class 'float'>.", topic: "Python Basics" },
    { id: "d2", title: "Statistics Spire", level: 2, xp: 150, coins: 75, desc: "Scale the heights of statistical knowledge.", question: "What is the median of: 3, 7, 1, 9, 4?", options: ["4","5","4.8","7"], answer: 0, explanation: "Sorted: 1,3,4,7,9. The middle value (3rd of 5) is 4.", topic: "Statistics" },
    { id: "d3", title: "Pandas Peaks", level: 3, xp: 200, coins: 100, desc: "Tame the powerful Pandas library.", question: "Which Pandas method displays the first 5 rows of a DataFrame?", options: ["df.top()","df.first()","df.head()","df.show()"], answer: 2, explanation: "df.head() returns the first n rows (default 5) of a DataFrame.", topic: "Pandas" },
    { id: "d4", title: "ML Mountain", level: 4, xp: 250, coins: 125, desc: "Ascend to the peak of machine learning.", question: "Which algorithm is used for classification with a straight-line boundary?", options: ["K-Means","Linear Regression","Logistic Regression","DBSCAN"], answer: 2, explanation: "Logistic Regression is a classification algorithm that uses a linear decision boundary.", topic: "ML Basics" },
    { id: "d5", title: "Neural Nexus", level: 5, xp: 300, coins: 150, desc: "Unlock the power of neural networks.", question: "What is the role of an 'activation function' in a neural network?", options: ["Store weights","Train the model","Introduce non-linearity","Normalize data"], answer: 2, explanation: "Activation functions introduce non-linearity, allowing networks to learn complex patterns.", topic: "Deep Learning" },
  ],
  agenticai: [
    { id: "ai1", title: "Agentic Awakening", level: 1, xp: 100, coins: 50, desc: "First steps into autonomous reasoning.", question: "What is the core property of an 'Agent'?", options: ["Static responses","Goal-directed sequential actions","Hardcoded rules only","No external tool access"], answer: 1, explanation: "Agents plan and take multiple actions autonomously to achieve a goal.", topic: "Introduction" },
  ],
  dsa: [
    { id: "ds1", title: "Array Archipelago", level: 1, xp: 100, coins: 50, desc: "Navigate the basics of memory layout.", question: "What is the time complexity of array index access?", options: ["O(n)","O(1)","O(log n)","O(n²)"], answer: 1, explanation: "Arrays provide constant time access via offset calculation.", topic: "Arrays" },
  ],
  mathematics: [
    { id: "m1", title: "Calculus Cathedral", level: 1, xp: 100, coins: 50, desc: "Study the language of change.", question: "What is the derivative of x²?", options: ["2x","x³/3","2","x"], answer: 0, explanation: "The power rule: d/dx(x^n) = n*x^(n-1).", topic: "Calculus" },
  ],
  chemistry: [
    { id: "c1", title: "Atomic Alchemy", level: 1, xp: 100, coins: 50, desc: "Explore the building blocks of matter.", question: "What is the atomic number of Carbon?", options: ["4","6","8","10"], answer: 1, explanation: "Carbon has 6 protons in its nucleus.", topic: "Atomic Structure" },
  ],
  physics: [
    { id: "p1", title: "Kinetic Kingdom", level: 1, xp: 100, coins: 50, desc: "Master the laws of motion.", question: "What is the SI unit of Force?", options: ["Watt","Joule","Newton","Pascal"], answer: 2, explanation: "Force is measured in Newtons (N), defined as 1 kg*m/s².", topic: "Mechanics" },
  ],
};

export const BADGES = [
  { id: "first_step", name: "Baby Steps", icon: "Sprout", desc: "First masteries. Answer 1 question correctly.", condition: (u) => u.perfectAnswers >= 1 || u.totalQuestsCompleted >= 1 },
  { id: "first_quest", name: "Quest Starter", icon: "Target", desc: "Complete your first quest", condition: (u) => u.completedQuests.length >= 1 },
  { id: "wealthy_start", name: "Pocket Change", icon: "Coins", desc: "Earn 50 coins", condition: (u) => u.totalCoins >= 50 },
  { id: "xp100", name: "Century Club", icon: "Zap", desc: "Earn 100 XP", condition: (u) => u.xp >= 100 },
  { id: "xp500", name: "XP Hunter", icon: "Star", desc: "Earn 500 XP", condition: (u) => u.xp >= 500 },
  { id: "streak3", name: "On Fire", icon: "Flame", desc: "3-day streak", condition: (u) => u.streak >= 3 },
  { id: "streak7", name: "Week Warrior", icon: "Calendar", desc: "7-day streak", condition: (u) => u.streak >= 7 },
  { id: "level5", name: "Rising Star", icon: "Trophy", desc: "Reach level 5", condition: (u) => u.level >= 5 },
  { id: "level10", name: "Ascendant", icon: "Rocket", desc: "Reach level 10", condition: (u) => u.level >= 10 },
  { id: "all_paths", name: "Pathfinder", icon: "Map", desc: "Try all skill paths", condition: (u) => new Set(u.completedQuests.map(q => q.pathId)).size >= 4 },
  { id: "perfect", name: "Perfectionist", icon: "Diamond", desc: "Answer correctly on first try 5 times", condition: (u) => u.perfectAnswers >= 5 },
  { id: "coins100", name: "Gold Hoarder", icon: "Gem", desc: "Earn 100 coins", condition: (u) => u.totalCoins >= 100 },
];

export const LEADERBOARD = [
  { name: "ShadowMage", avatar: "🧙", xp: 4200, level: 18, streak: 12 },
  { name: "DragonSlayer", avatar: "🐉", xp: 3800, level: 16, streak: 7 },
  { name: "SwiftArrow", avatar: "🏹", xp: 3200, level: 14, streak: 21 },
  { name: "IronWolf", avatar: "🐺", xp: 2900, level: 13, streak: 5 },
  { name: "GoldenFox", avatar: "🦊", xp: 2400, level: 11, streak: 9 },
];

export const calcLevel = (xp) => Math.floor(xp / 200) + 1;
export const calcXpForLevel = (level) => (level - 1) * 200;
export const calcXpToNext = (xp) => {
  const lvl = calcLevel(xp);
  return calcXpForLevel(lvl + 1) - xp;
};
export const calcLevelProgress = (xp) => {
  const lvl = calcLevel(xp);
  const start = calcXpForLevel(lvl);
  const end = calcXpForLevel(lvl + 1);
  return ((xp - start) / (end - start)) * 100;
};
