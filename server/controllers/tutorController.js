const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

/**
 * 🛠️ Provider Factory
 * Automatically selects the AI engine based on the API keys in .env
 */
const getAIProvider = (userContext) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Detect Provider Priority
  let providerType = "gemini";
  let apiKey = geminiKey;

  if (openaiKey) {
    providerType = "openai";
    apiKey = openaiKey;
  } else if (geminiKey && geminiKey.startsWith("sk-")) {
    providerType = "openai";
    apiKey = geminiKey;
  } else if (geminiKey && geminiKey.startsWith("nvapi-")) {
    providerType = "nvidia";
    apiKey = geminiKey;
  }

  if (apiKey && apiKey.startsWith("nvapi-")) {
    providerType = "nvidia";
  } else if (apiKey && apiKey.startsWith("sk-")) {
    providerType = "openai";
  }

  // 2. Persona / System Instruction
  const systemInstruction = `You are Sage, a legendary AI Tutor in the "LevelUp Learning" gamified platform. 
  Subject Expertise: Web Development, Data Science, Math/Aptitude, English, Agentic AI, DSA, Mathematics, Chemistry, and Physics.
  Student Info: ${userContext?.username || 'Warrior'}, Level ${userContext?.level || 1}.
  Your Teacher Methodology:
  1. Explain concepts simply and clearly using gaming metaphors (quests, buffs, dungeon loot).
  2. If a student asks for an answer, give a HINT or a nudge first. Don't just give the solution immediately.
  3. Be exceptionally friendly, motivating, and encouraging.
  4. Keep responses high-impact but concise (max 3-4 sentences).
  5. Use emojis to fit the gamified theme (⚔️, 📜, 🛡️, 💎).`;

  return { providerType, apiKey, systemInstruction };
};

/**
 * POST /api/tutor/chat
 */
const chat = async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    const { providerType, apiKey, systemInstruction } = getAIProvider(userContext);

    if (!apiKey) {
      return res.json({
        reply: "⚡ I'm Sage, your AI Tutor! To unlock my wisdom, please add a Gemini, OpenAI, or NVIDIA API key to your .env file."
      });
    }

    if (providerType === "gemini") {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
      const history = (messages || []).slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));
      const lastMessage = messages[messages.length - 1]?.content || "Hello!";
      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(lastMessage);
      return res.json({ reply: result.response.text().trim() });
    } else {
      // OpenAI or NVIDIA NIM
      const config = { apiKey };
      if (providerType === "nvidia") {
        config.baseURL = "https://integrate.api.nvidia.com/v1";
      }
      
      const openai = new OpenAI(config);
      const history = (messages || []).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      }));

      const response = await openai.chat.completions.create({
        model: providerType === "nvidia" ? "meta/llama-3.1-405b-instruct" : "gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstruction },
          ...history
        ],
        max_tokens: 300
      });

      return res.json({ reply: response.choices[0].message.content.trim() });
    }

  } catch (err) {
    console.error("Sage Chat Error:", err);
    let errorMessage = "⚡ My magical connection flickered. Please try again!";
    if (err.message.includes("API key")) errorMessage = "🚫 Your API Key appears invalid. Please check your .env settings.";
    res.status(500).json({ reply: errorMessage });
  }
};

/**
 * POST /api/tutor/explain
 */
const explain = async (req, res) => {
  try {
    const { question, wrongAnswer, correctAnswer, explanation } = req.body;
    const { providerType, apiKey } = getAIProvider({});

    if (!apiKey) {
      return res.json({ reply: explanation || "To unlock my simplified scrolls, add an API key! 📜" });
    }

    const prompt = `Student failed a trial phase. Explain the concept simply in 2 sentences.
    Question: ${question}
    Wrong Choice: ${wrongAnswer}
    Correct Truth: ${correctAnswer}
    Sage's Goal: Bridge the gap with a simple explanation and a motivating emoji.`;

    if (providerType === "gemini") {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      res.json({ reply: result.response.text().trim() });
    } else {
      const config = { apiKey };
      if (providerType === "nvidia") config.baseURL = "https://integrate.api.nvidia.com/v1";
      const openai = new OpenAI(config);
      const response = await openai.chat.completions.create({
        model: providerType === "nvidia" ? "meta/llama-3.1-405b-instruct" : "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200
      });
      res.json({ reply: response.choices[0].message.content.trim() });
    }

  } catch (err) {
    console.error("Sage Explanation Error:", err);
    res.status(500).json({ reply: explanation || "A glitch in the matrix!" });
  }
};

module.exports = { chat, explain };