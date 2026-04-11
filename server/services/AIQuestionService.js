const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AI_KEY_REQUISITE");

/**
 * AIQuestionService.js
 * Generates dynamic, adaptive MCQ questions using Google Gemini API.
 * Ensures uniqueness and difficulty scaling.
 */
class AIQuestionService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateQuestions(level, type, count = 10, history = []) {
    const prompt = `
      As a Senior ${type} Interviewer, generate ${count} unique multiple-choice questions for Level ${level}.
      
      Topic: ${type} (Aptitude, Logic, Quantitative)
      Difficulty: ${level < 3 ? 'Easy' : level < 7 ? 'Medium' : 'Hard'}
      Avoid these previous topics/concepts: ${history.join(', ')}

      Return ONLY a JSON array of objects with this structure (no markdown, no preamble):
      [
        {
          "question": "string",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "correctAnswer": number (0-3),
          "xpReward": number (usually 20),
          "explanation": "string",
          "difficulty": "easy/medium/hard"
        }
      ]

      Ensure:
      1. Numerical values are randomized.
      2. Question wording is professional and clear.
      3. Exactly 4 options per question.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const output = result.response.text();
      
      // Clean up potential markdown formatting if Gemini includes it
      const jsonString = output.replace(/```json|```/g, "").trim();
      const questions = JSON.parse(jsonString);

      if (!Array.isArray(questions)) throw new Error("Invalid AI output format");
      
      console.log(`[AIQuestionService] Successfully generated ${questions.length} questions for Level ${level}`);
      return questions;
    } catch (err) {
      console.error("[AIQuestionService] Generation Error:", err);
      // Fallback for demo when API key is missing
      return this.getFallbackQuestions(level, type, count);
    }
  }

  getFallbackQuestions(level, type, count) {
    console.warn("[AIQuestionService] Using fallback questions.");
    return Array(count).fill(null).map((_, i) => ({
      question: `Fallback Question ${i + 1} for ${type} Level ${level}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: Math.floor(Math.random() * 4),
      xpReward: 20,
      explanation: "This is a fallback response due to API unavailability.",
      difficulty: "easy"
    }));
  }
}

module.exports = new AIQuestionService();
