const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/tutor/chat
 * Main chat interaction with "Sage"
 */
const chat = async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Fallback check for missing API Key
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY is missing in .env.");
      return res.json({
        reply: "⚡ I'm Sage, your AI Tutor! I'm currently in 'Practice Mode' because my scrolls of power (API Key) are missing. Connect them to unlock my full wisdom!"
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Construct gamified System Prompt
    const systemPrompt = `You are Sage, an enthusiastic AI tutor in a gamified learning platform called LevelUp Learning.
You help students with Web Development, Math/Aptitude, English, and Data Science.
The student is named ${userContext?.username || 'Warrior'}, currently at Level ${userContext?.level || 1} with ${userContext?.xp || 0} XP.
Tone: Gamified, encouraging, very concise (2-4 sentences max).
Style: Use gaming metaphors (quests, dungeons, buffs) and emojis. Always frame learning as an adventure.

---
CONVERSATION HISTORY:
`;

    // 3. Convert messages into a readable conversation string (as requested)
    const conversation = (messages || [])
      .map((m) => `${m.role === "user" ? "Warrior" : "Sage"}: ${m.content}`)
      .join("\n");

    const finalPrompt = `${systemPrompt}${conversation}\nSage:`;

    // 4. Generate Content (Stateless mode with explicit role wrapping to avoid API errors)
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
    });
    const reply = result.response.text().trim();

    res.json({ reply });

  } catch (err) {
    console.error("Sage Tutor Error:", err.message);
    res.status(500).json({
      reply: "⚡ My magical connection flickered. A dragon must be chewing on the cables! Please try again in a moment."
    });
  }
};

/**
 * POST /api/tutor/explain
 * Simple diagnostic explanations for wrong answers
 */
const explain = async (req, res) => {
  try {
    const { question, wrongAnswer, correctAnswer, explanation } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        reply: explanation || "To unlock my simplified scrolls, set the GEMINI_API_KEY! 📜"
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `A student answered a quiz question incorrectly. Explain the concept simply in 2-3 sentences.
Tone: Encouraging, positive, and clear. Use an emoji.
Question: ${question}
Victim's Choice: ${wrongAnswer}
Correct Truth: ${correctAnswer}
Sage's Hint: ${explanation}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    res.json({ reply });

  } catch (err) {
    console.error("Sage Explanation Error:", err.message);
    res.status(500).json({
      reply: explanation || "A glitch in the matrix! Here is the base hint: " + explanation
    });
  }
};

module.exports = { chat, explain };