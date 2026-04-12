const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const Quest = require("../models/Quest");

/**
 * 🛠️ AI Provider Helper (Simplified/Shared Logic)
 */
const getAIClient = () => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let key = openaiKey || geminiKey;
  let type = "gemini";

  if (key && key.startsWith("nvapi-")) {
    type = "nvidia";
  } else if (key && key.startsWith("sk-")) {
    type = "openai";
  } else if (openaiKey && !openaiKey.startsWith("nvapi-")) {
    type = "openai";
  } else if (geminiKey) {
    type = "gemini";
  }

  return { type, key };
};

/**
 * POST /api/quests/generate
 */
const generateQuiz = async (req, res) => {
  try {
    const { subject, level } = req.body;
    const numQuestions = 5;

    if (!subject) return res.status(400).json({ error: "Subject is required!" });

    const { type, key } = getAIClient();
    if (!key) return res.status(500).json({ error: "AI Service not configured. Please add an API key." });

    const prompt = `You are an AI quiz generator for a gamified learning platform.
Task: Generate quiz questions based on the subject provided by the user.
Input:
{
  "subject": "${subject}",
  "level": "${level || 'beginner'}",
  "numQuestions": ${numQuestions}
}
Rules:
- Generate high-quality, unique questions
- Questions must match the subject and difficulty level
- Use MCQ format (Multiple Choice Questions)
- Each question should have 4 options
- Only ONE correct answer
- Avoid repeating questions
Output Format (STRICT JSON):
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string", (This must be the EXACT string from one of the options)
      "explanation": "string"
    }
  ]
}
Behavior:
- If subject is vague, assume general fundamentals
- If subject is advanced (e.g., DSA, AI), generate conceptual + problem-based questions
- Keep questions clear and not too lengthy
- Make it suitable for a gamified quiz system
Return ONLY the JSON.`;

    let quizData;

    if (type === "gemini") {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      quizData = JSON.parse(text);
    } else {
      const config = { apiKey: key };
      if (type === "nvidia") config.baseURL = "https://integrate.api.nvidia.com/v1";
      
      const openai = new OpenAI(config);
      const response = await openai.chat.completions.create({
        model: type === "nvidia" ? "meta/llama-3.1-405b-instruct" : "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      quizData = JSON.parse(response.choices[0].message.content);
    }

    if (!quizData || !quizData.questions) {
      throw new Error("Invalid AI response format");
    }

    // Transform to Quest Schema
    // In our Quest schema, correctAnswer is an INDEX, but user prompt asked for the ANSWER STRING.
    const questions = quizData.questions.map(q => {
      const correctIdx = q.options.indexOf(q.answer);
      return {
        question: q.question,
        options: q.options,
        correctAnswer: correctIdx === -1 ? 0 : correctIdx, // Fallback to 0 if match fails
        explanation: q.explanation,
        xpReward: 20
      };
    });

    const timestamp = Date.now();
    const questId = `ai_${subject.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;

    const newQuest = await Quest.create({
      id: questId,
      title: `${subject.toUpperCase()} TRIAL`,
      level: 1, // Custom quests are level 1
      pathId: 'others',
      type: 'others', // Corrected path type
      description: `A custom AI-generated trial about ${subject} (${level}).`,
      questions,
      isAI: true,
      createdBy: req.user._id
    });

    res.status(201).json(newQuest);

  } catch (err) {
    console.error("AI Generation Error:", err);
    res.status(500).json({ error: "Failed to conjure the AI trial. Magic flow disrupted. 🪄" });
  }
};

module.exports = { generateQuiz };
