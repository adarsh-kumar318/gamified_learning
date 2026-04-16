/**
 * Seed script — Battle Questions (Firebase/Firestore)
 * Run from project root:  node server/scripts/seedBattleQuestions.js
 * Force re-seed all:      node server/scripts/seedBattleQuestions.js --force
 *
 * Subjects: Agentic AI | DSA | Mathematics | Science
 * Format:   { subject, topic, question, options[4], correctAnswer(0-3), difficulty, explanation }
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { db } = require('../utils/firebase');

const FORCE = process.argv.includes('--force');

const QUESTIONS = [

  /* ═══════════════════════════════════════════════════════════
     AGENTIC AI  (15 questions)
     Topics: Autonomous Agents · LLM Agents · Planning · Multi-Agent
  ═══════════════════════════════════════════════════════════ */
  {
    subject: 'Agentic AI', topic: 'Autonomous Agents', difficulty: 'easy',
    question: 'What is the core property that makes an AI system "agentic"?',
    options: ['It can process images', 'It takes sequential actions toward a goal', 'It uses GPT-4 as backbone', 'It stores data in a vector database'],
    correctAnswer: 1,
    explanation: 'Agentic AI systems autonomously take a sequence of actions—planning, calling tools, and adapting—to achieve a goal.'
  },
  {
    subject: 'Agentic AI', topic: 'LLM Agents', difficulty: 'easy',
    question: 'Which framework popularized the "ReAct" pattern for LLM agents?',
    options: ['AutoGPT', 'LangChain', 'Hugging Face', 'OpenAI Assistants'],
    correctAnswer: 1,
    explanation: 'LangChain popularized ReAct (Reasoning + Acting), where the LLM reasons step-by-step and then calls tools.'
  },
  {
    subject: 'Agentic AI', topic: 'Planning', difficulty: 'medium',
    question: 'In Chain-of-Thought (CoT) prompting, what does the model generate before the final answer?',
    options: ['A summary', 'A list of embeddings', 'Step-by-step reasoning', 'A probability distribution'],
    correctAnswer: 2,
    explanation: 'CoT prompting asks the model to produce intermediate reasoning steps, improving accuracy on complex tasks.'
  },
  {
    subject: 'Agentic AI', topic: 'Multi-Agent Systems', difficulty: 'medium',
    question: 'In a multi-agent system, what is the role of the "orchestrator" agent?',
    options: [
      'Stores data in memory',
      'Coordinates and delegates tasks to sub-agents',
      'Only generates text responses',
      'Manages database connections'
    ],
    correctAnswer: 1,
    explanation: 'The orchestrator breaks down a goal into subtasks and routes them to specialized sub-agents for execution.'
  },
  {
    subject: 'Agentic AI', topic: 'LLM Agents', difficulty: 'medium',
    question: 'What does "tool use" mean in the context of LLM agents?',
    options: [
      'Using a hardware accelerator',
      'The LLM calling external APIs or functions',
      'Fine-tuning on a new dataset',
      'Running inference on CPU'
    ],
    correctAnswer: 1,
    explanation: 'Tool use allows LLMs to call external functions (calculator, search, code interpreter) to extend their capabilities.'
  },
  {
    subject: 'Agentic AI', topic: 'Planning', difficulty: 'hard',
    question: 'Which planning technique breaks a high-level goal into a tree of sub-goals and searches for the optimal path?',
    options: ['Monte Carlo Tree Search', 'Beam Search', 'Hierarchical Task Network (HTN)', 'Gradient Descent'],
    correctAnswer: 2,
    explanation: 'HTN planning decomposes complex tasks recursively into sub-tasks until primitive executable actions are reached.'
  },
  {
    subject: 'Agentic AI', topic: 'Autonomous Agents', difficulty: 'hard',
    question: 'What is "reflection" in the context of LLM-based autonomous agents?',
    options: [
      'The model mirroring training data',
      'The agent evaluating and critiquing its own previous outputs',
      'A type of attention mechanism',
      'Rotating model weights during inference'
    ],
    correctAnswer: 1,
    explanation: 'Reflection lets an agent self-evaluate past actions, identify errors, and refine its plan, improving long-horizon task performance.'
  },
  {
    subject: 'Agentic AI', topic: 'Multi-Agent Systems', difficulty: 'easy',
    question: 'Which protocol was recently standardized to allow AI agents across different frameworks to communicate?',
    options: ['REST', 'GraphQL', 'Model Context Protocol (MCP)', 'WebSockets'],
    correctAnswer: 2,
    explanation: 'MCP (Model Context Protocol by Anthropic) standardizes how agents expose tools and resources across systems.'
  },
  {
    subject: 'Agentic AI', topic: 'LLM Agents', difficulty: 'medium',
    question: 'What does RAG stand for in the context of LLM systems?',
    options: [
      'Rapid Agent Generation',
      'Retrieval-Augmented Generation',
      'Recursive Attention Graph',
      'Reinforcement Agent Guidance'
    ],
    correctAnswer: 1,
    explanation: 'RAG retrieves relevant documents from a knowledge base and feeds them as context to the LLM, reducing hallucinations.'
  },
  {
    subject: 'Agentic AI', topic: 'Planning', difficulty: 'medium',
    question: 'What is "hallucination" in large language models?',
    options: [
      'The model refusing to answer',
      'Generating confident but factually incorrect information',
      'Running out of context window',
      'Using the wrong tokenizer'
    ],
    correctAnswer: 1,
    explanation: 'Hallucination occurs when an LLM generates plausible-sounding but factually wrong or fabricated information.'
  },
  {
    subject: 'Agentic AI', topic: 'Autonomous Agents', difficulty: 'hard',
    question: 'In the Voyager paper (GPT-4 Minecraft agent), what method is used to store and reuse learned skills?',
    options: ['Fine-tuning', 'Vector skill library with executable code', 'RLHF reward model', 'Prompt chaining'],
    correctAnswer: 1,
    explanation: 'Voyager stores verified JavaScript functions as skills in a vector DB; the agent retrieves and reuses relevant skills automatically.'
  },
  {
    subject: 'Agentic AI', topic: 'Multi-Agent Systems', difficulty: 'hard',
    question: 'Which problem describes agents failing to coordinate because they each optimize locally without full information?',
    options: ['Gradient vanishing', 'Non-stationarity', 'The tragedy of the commons', 'Catastrophic forgetting'],
    correctAnswer: 1,
    explanation: 'Non-stationarity in multi-agent systems occurs because each agent\'s environment changes as other agents learn, making training unstable.'
  },
  {
    subject: 'Agentic AI', topic: 'LLM Agents', difficulty: 'easy',
    question: 'What is the purpose of a "system prompt" in an LLM agent?',
    options: [
      'To set the hardware configuration',
      'To define the agent\'s persona, tools and behavioral constraints',
      'To initialize the database',
      'To compress the model weights'
    ],
    correctAnswer: 1,
    explanation: 'The system prompt defines agent identity, available tools, output format, and rules before any user conversation begins.'
  },
  {
    subject: 'Agentic AI', topic: 'Planning', difficulty: 'medium',
    question: 'What is "grounding" in the context of agentic AI?',
    options: [
      'Connecting LLM outputs to real-world observations and facts',
      'Setting learning rate to zero',
      'Embedding audio signals',
      'Optimizing GPU memory'
    ],
    correctAnswer: 0,
    explanation: 'Grounding connects LLM-generated text to verifiable, real-world information to reduce hallucination and improve reliability.'
  },
  {
    subject: 'Agentic AI', topic: 'Multi-Agent Systems', difficulty: 'medium',
    question: 'In AutoGen (Microsoft), agents communicate by:',
    options: [
      'Sharing GPU memory',
      'Exchanging structured messages in a conversation',
      'Writing to a shared SQL database',
      'Broadcasting on an event bus only'
    ],
    correctAnswer: 1,
    explanation: 'AutoGen agents communicate via structured conversational messages, allowing flexible collaboration patterns.'
  },

  /* ═══════════════════════════════════════════════════════════
     DSA  (15 questions)
     Topics: Arrays · Linked Lists · Trees · Graphs · Sorting & Searching
  ═══════════════════════════════════════════════════════════ */
  {
    subject: 'DSA', topic: 'Arrays', difficulty: 'easy',
    question: 'What is the time complexity of accessing an element by index in an array?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    correctAnswer: 2,
    explanation: 'Arrays store elements in contiguous memory, so index-based access is constant time O(1).'
  },
  {
    subject: 'DSA', topic: 'Sorting & Searching', difficulty: 'easy',
    question: 'What is the best-case time complexity of Bubble Sort?',
    options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
    correctAnswer: 2,
    explanation: 'When the array is already sorted, Bubble Sort with early exit runs in O(n) — one pass without any swaps.'
  },
  {
    subject: 'DSA', topic: 'Linked Lists', difficulty: 'easy',
    question: 'Which operation is faster in a linked list compared to an array?',
    options: ['Random access', 'Insertion at beginning', 'Binary search', 'Sorting'],
    correctAnswer: 1,
    explanation: 'Inserting at the beginning of a linked list is O(1) — just update the head pointer. Arrays require shifting all elements.'
  },
  {
    subject: 'DSA', topic: 'Trees', difficulty: 'medium',
    question: 'In a Binary Search Tree (BST), where is the largest element located?',
    options: ['Root', 'Leftmost node', 'Rightmost node', 'Random position'],
    correctAnswer: 2,
    explanation: 'In a BST, the right subtree always contains larger values, so the rightmost node holds the maximum element.'
  },
  {
    subject: 'DSA', topic: 'Graphs', difficulty: 'medium',
    question: 'Which algorithm finds the shortest path in an unweighted graph?',
    options: ['DFS', 'Dijkstra', 'BFS', 'Prim\'s'],
    correctAnswer: 2,
    explanation: 'BFS (Breadth-First Search) explores nodes level by level, guaranteeing the shortest path (fewest edges) in unweighted graphs.'
  },
  {
    subject: 'DSA', topic: 'Sorting & Searching', difficulty: 'medium',
    question: 'What is the time complexity of Binary Search?',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
    correctAnswer: 2,
    explanation: 'Binary Search halves the search space each step, giving O(log n) time complexity — requires a sorted array.'
  },
  {
    subject: 'DSA', topic: 'Trees', difficulty: 'hard',
    question: 'What is the height of a complete binary tree with n nodes?',
    options: ['O(n)', 'O(√n)', 'O(log n)', 'O(n log n)'],
    correctAnswer: 2,
    explanation: 'A complete binary tree fills levels left to right; with n nodes it has ⌊log₂n⌋ height — O(log n).'
  },
  {
    subject: 'DSA', topic: 'Graphs', difficulty: 'hard',
    question: 'Which algorithm uses dynamic programming to find all-pairs shortest paths?',
    options: ['Dijkstra', 'Bellman-Ford', 'Floyd-Warshall', 'Kruskal\'s'],
    correctAnswer: 2,
    explanation: 'Floyd-Warshall runs in O(V³) and computes shortest paths between every pair of vertices using DP.'
  },
  {
    subject: 'DSA', topic: 'Arrays', difficulty: 'medium',
    question: 'What technique solves the "Two Sum" problem in O(n) time?',
    options: ['Two pointers on sorted array', 'Hash map lookup', 'Nested loops', 'Binary search'],
    correctAnswer: 1,
    explanation: 'Store each number in a hash map; for each element check if (target - element) exists — O(n) time, O(n) space.'
  },
  {
    subject: 'DSA', topic: 'Linked Lists', difficulty: 'medium',
    question: 'How do you detect a cycle in a linked list efficiently?',
    options: [
      'Use an array to store visited nodes',
      'Floyd\'s Cycle Detection (slow/fast pointers)',
      'Sort the list first',
      'Reverse the list'
    ],
    correctAnswer: 1,
    explanation: 'Floyd\'s algorithm uses two pointers — slow (1 step) and fast (2 steps). If they meet, a cycle exists. O(n) time, O(1) space.'
  },
  {
    subject: 'DSA', topic: 'Sorting & Searching', difficulty: 'hard',
    question: 'Why is Quick Sort\'s worst case O(n²)? When does it occur?',
    options: [
      'When pivot is always the median',
      'When the array is already sorted and pivot is always min/max',
      'When array has all duplicates',
      'When recursion depth exceeds log n'
    ],
    correctAnswer: 1,
    explanation: 'If the pivot is always the smallest/largest element (e.g., sorted input with first-element pivot), partitions are unbalanced — O(n²).'
  },
  {
    subject: 'DSA', topic: 'Trees', difficulty: 'medium',
    question: 'What traversal visits nodes in Left → Root → Right order?',
    options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
    correctAnswer: 1,
    explanation: 'In-order traversal (Left → Root → Right) of a BST produces nodes in ascending sorted order.'
  },
  {
    subject: 'DSA', topic: 'Graphs', difficulty: 'easy',
    question: 'What data structure does Dijkstra\'s algorithm typically use for efficiency?',
    options: ['Stack', 'Queue', 'Min-Heap (Priority Queue)', 'Hash Map'],
    correctAnswer: 2,
    explanation: 'A min-heap allows Dijkstra to always process the unvisited node with the smallest known distance in O(log V) time.'
  },
  {
    subject: 'DSA', topic: 'Arrays', difficulty: 'hard',
    question: 'What is the space complexity of Merge Sort?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correctAnswer: 2,
    explanation: 'Merge Sort requires auxiliary O(n) space for temporary arrays during the merge step.'
  },
  {
    subject: 'DSA', topic: 'Linked Lists', difficulty: 'hard',
    question: 'To reverse a singly linked list in-place, what is the minimum number of pointers needed?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 2,
    explanation: 'Three pointers are needed: prev, current, and next — to re-link nodes without losing track of the rest of the list.'
  },

  /* ═══════════════════════════════════════════════════════════
     MATHEMATICS  (12 questions)
     Topics: Algebra · Probability · Arithmetic · Geometry
  ═══════════════════════════════════════════════════════════ */
  {
    subject: 'Mathematics', topic: 'Algebra', difficulty: 'easy',
    question: 'If 3x + 6 = 21, what is the value of x?',
    options: ['3', '5', '7', '9'],
    correctAnswer: 1,
    explanation: '3x = 21 - 6 = 15, so x = 15/3 = 5.'
  },
  {
    subject: 'Mathematics', topic: 'Probability', difficulty: 'easy',
    question: 'A fair die is rolled. What is the probability of getting a number greater than 4?',
    options: ['1/6', '1/3', '1/2', '2/3'],
    correctAnswer: 1,
    explanation: 'Numbers greater than 4 on a die: {5, 6} = 2 outcomes. P = 2/6 = 1/3.'
  },
  {
    subject: 'Mathematics', topic: 'Arithmetic', difficulty: 'easy',
    question: 'What is 15% of 240?',
    options: ['32', '36', '38', '40'],
    correctAnswer: 1,
    explanation: '15% of 240 = (15/100) × 240 = 0.15 × 240 = 36.'
  },
  {
    subject: 'Mathematics', topic: 'Geometry', difficulty: 'easy',
    question: 'What is the area of a circle with radius 7? (Use π ≈ 22/7)',
    options: ['144 sq units', '154 sq units', '164 sq units', '176 sq units'],
    correctAnswer: 1,
    explanation: 'Area = πr² = (22/7) × 49 = 22 × 7 = 154 sq units.'
  },
  {
    subject: 'Mathematics', topic: 'Algebra', difficulty: 'medium',
    question: 'Which of the following is a factor of x² - 9?',
    options: ['(x - 3)(x - 3)', '(x + 9)', '(x - 3)(x + 3)', '(x + 3)(x + 3)'],
    correctAnswer: 2,
    explanation: 'x² - 9 = x² - 3² = (x - 3)(x + 3) — difference of squares identity.'
  },
  {
    subject: 'Mathematics', topic: 'Probability', difficulty: 'medium',
    question: 'Two cards are drawn from a 52-card deck without replacement. What is the probability both are aces?',
    options: ['1/221', '1/169', '4/221', '1/52'],
    correctAnswer: 0,
    explanation: 'P = (4/52) × (3/51) = 12/2652 = 1/221.'
  },
  {
    subject: 'Mathematics', topic: 'Arithmetic', difficulty: 'medium',
    question: 'A train travels 360 km in 4 hours. What is its average speed in km/h?',
    options: ['80', '90', '100', '72'],
    correctAnswer: 1,
    explanation: 'Speed = Distance / Time = 360 / 4 = 90 km/h.'
  },
  {
    subject: 'Mathematics', topic: 'Geometry', difficulty: 'medium',
    question: 'The angles of a triangle are in ratio 2:3:5. What is the largest angle?',
    options: ['60°', '72°', '90°', '100°'],
    correctAnswer: 2,
    explanation: '2k + 3k + 5k = 180° → 10k = 180° → k = 18°. Largest = 5 × 18° = 90°.'
  },
  {
    subject: 'Mathematics', topic: 'Algebra', difficulty: 'hard',
    question: 'For what value of k does kx² + 4x + 1 = 0 have equal roots?',
    options: ['2', '4', '8', '16'],
    correctAnswer: 1,
    explanation: 'Equal roots when discriminant = 0: b² - 4ac = 0 → 16 - 4k = 0 → k = 4.'
  },
  {
    subject: 'Mathematics', topic: 'Probability', difficulty: 'hard',
    question: 'In a bag of 5 red and 3 blue marbles, two are drawn. What is P(both same colour)?',
    options: ['13/28', '15/28', '13/56', '11/28'],
    correctAnswer: 0,
    explanation: 'P(both red) = C(5,2)/C(8,2) = 10/28. P(both blue) = C(3,2)/C(8,2) = 3/28. Total = 13/28.'
  },
  {
    subject: 'Mathematics', topic: 'Arithmetic', difficulty: 'hard',
    question: 'If A is 20% more than B and B is 25% less than C, then A is what % of C?',
    options: ['80%', '90%', '100%', '110%'],
    correctAnswer: 1,
    explanation: 'B = 0.75C, A = 1.2B = 1.2 × 0.75C = 0.9C. So A is 90% of C.'
  },
  {
    subject: 'Mathematics', topic: 'Geometry', difficulty: 'hard',
    question: 'A cone has height 12 cm and base radius 5 cm. What is its slant height?',
    options: ['11 cm', '12 cm', '13 cm', '15 cm'],
    correctAnswer: 2,
    explanation: 'Slant height l = √(r² + h²) = √(25 + 144) = √169 = 13 cm.'
  },

  /* ═══════════════════════════════════════════════════════════
     SCIENCE  (12 questions)
     Topics: Physics · Chemistry · Biology
  ═══════════════════════════════════════════════════════════ */
  {
    subject: 'Science', topic: 'Physics', difficulty: 'easy',
    question: 'What is the SI unit of force?',
    options: ['Joule', 'Watt', 'Newton', 'Pascal'],
    correctAnswer: 2,
    explanation: 'Force is measured in Newtons (N). 1 N = 1 kg·m/s² — defined by F = ma.'
  },
  {
    subject: 'Science', topic: 'Chemistry', difficulty: 'easy',
    question: 'What is the atomic number of Carbon?',
    options: ['4', '6', '8', '12'],
    correctAnswer: 1,
    explanation: 'Carbon has 6 protons, so its atomic number is 6. It is the basis of all organic chemistry.'
  },
  {
    subject: 'Science', topic: 'Biology', difficulty: 'easy',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
    correctAnswer: 2,
    explanation: 'Mitochondria produce ATP through cellular respiration, supplying energy for cellular activities.'
  },
  {
    subject: 'Science', topic: 'Physics', difficulty: 'medium',
    question: 'A 2 kg object is accelerated at 5 m/s². What is the net force applied?',
    options: ['2.5 N', '7 N', '10 N', '20 N'],
    correctAnswer: 2,
    explanation: 'F = ma = 2 kg × 5 m/s² = 10 N (Newton\'s second law).'
  },
  {
    subject: 'Science', topic: 'Chemistry', difficulty: 'medium',
    question: 'What type of bond forms when electrons are shared between two non-metal atoms?',
    options: ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Hydrogen bond'],
    correctAnswer: 1,
    explanation: 'Covalent bonds form when non-metal atoms share electron pairs to achieve stable noble-gas configurations.'
  },
  {
    subject: 'Science', topic: 'Biology', difficulty: 'medium',
    question: 'Which blood vessels carry oxygenated blood away from the heart?',
    options: ['Veins', 'Capillaries', 'Arteries', 'Venules'],
    correctAnswer: 2,
    explanation: 'Arteries carry oxygenated blood away from the heart (except pulmonary arteries which carry deoxygenated blood).'
  },
  {
    subject: 'Science', topic: 'Physics', difficulty: 'easy',
    question: 'Light travels at approximately what speed in a vacuum?',
    options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'],
    correctAnswer: 1,
    explanation: 'The speed of light in a vacuum is approximately 3 × 10⁸ m/s (299,792,458 m/s exactly).'
  },
  {
    subject: 'Science', topic: 'Chemistry', difficulty: 'easy',
    question: 'What is the chemical formula of water?',
    options: ['HO', 'H₂O', 'H₂O₂', 'OH'],
    correctAnswer: 1,
    explanation: 'Water is H₂O — two hydrogen atoms covalently bonded to one oxygen atom.'
  },
  {
    subject: 'Science', topic: 'Biology', difficulty: 'easy',
    question: 'Which organ is responsible for pumping blood throughout the body?',
    options: ['Liver', 'Kidney', 'Lungs', 'Heart'],
    correctAnswer: 3,
    explanation: 'The heart is a muscular organ that pumps blood through the circulatory system via rhythmic contractions.'
  },
  {
    subject: 'Science', topic: 'Physics', difficulty: 'hard',
    question: 'An object falls freely from rest for 3 seconds. What is its velocity? (g = 10 m/s²)',
    options: ['20 m/s', '25 m/s', '30 m/s', '35 m/s'],
    correctAnswer: 2,
    explanation: 'v = u + gt = 0 + 10 × 3 = 30 m/s. Free fall under gravity with initial velocity = 0.'
  },
  {
    subject: 'Science', topic: 'Chemistry', difficulty: 'hard',
    question: 'In which reaction does a more reactive metal displace a less reactive metal from its salt solution?',
    options: ['Combination reaction', 'Decomposition reaction', 'Single displacement reaction', 'Double displacement reaction'],
    correctAnswer: 2,
    explanation: 'Single displacement reactions: A more reactive metal replaces a less reactive one (e.g., Zn + CuSO₄ → ZnSO₄ + Cu).'
  },
  {
    subject: 'Science', topic: 'Biology', difficulty: 'hard',
    question: 'What process allows plants to convert sunlight into chemical energy?',
    options: ['Respiration', 'Transpiration', 'Photosynthesis', 'Osmosis'],
    correctAnswer: 2,
    explanation: 'Photosynthesis: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Occurs in chloroplasts using chlorophyll.'
  },
];

async function seed() {
  try {
    console.log('🔥 Connecting to Firebase Firestore...');
    const collection = db.collection('battleQuestions');

    // ─ Step 1: fetch all existing question texts in one read ──────────────────────
    let existingSet = new Set();
    if (!FORCE) {
      console.log('🔍 Checking for existing questions...');
      const existing = await collection.select('question').get();
      existing.docs.forEach(d => existingSet.add(d.data().question));
      console.log(`   Found ${existingSet.size} existing question(s).\n`);
    } else {
      console.log('⚠️  --force flag detected: all questions will be re-inserted.\n');
    }

    // ─ Step 2: filter to only new questions ──────────────────────────────────
    const toInsert = QUESTIONS.filter(q => !existingSet.has(q.question));
    const skipped  = QUESTIONS.length - toInsert.length;

    if (toInsert.length === 0) {
      console.log('✅ All questions already exist. Nothing to insert.');
      console.log(`   Skipped: ${skipped} | Total in DB: ${existingSet.size}`);
      process.exit(0);
    }

    // ─ Step 3: write in Firestore batches (max 500 ops per batch) ──────────────
    const BATCH_SIZE = 499; // Firestore limit is 500 ops/batch
    let inserted = 0;

    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const chunk = toInsert.slice(i, i + BATCH_SIZE);
      const batch = db.batch();
      const now   = new Date().toISOString();

      chunk.forEach(q => {
        const ref = collection.doc(); // auto-ID
        batch.set(ref, { ...q, createdAt: now, updatedAt: now });
      });

      await batch.commit();
      inserted += chunk.length;
      console.log(`  ✅ Batch committed: ${inserted}/${toInsert.length} new questions written`);
    }

    console.log('\n📚 Seeding complete:');
    console.log(`   ✅ Inserted : ${inserted}`);
    console.log(`   ⏭️  Skipped  : ${skipped} (already exist)`);
    console.log(`   📊 Total    : ${inserted + skipped}`);
    console.log('\n💡 Tip: Create a Firestore composite index on (subject, difficulty) for faster queries.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();

