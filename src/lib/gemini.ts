import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getCareerAdvice = async (messages: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are 'CareerBuddy', an encouraging and knowledgeable career counselor for college students. 
  Your goal is to help students navigate their career paths based on their skills, year of study, and interests.
  
  When providing advice:
  1. Suggest 3-4 specific career paths matching their profile.
  2. List essential skills they need to learn for these paths.
  3. Recommend 2-3 high-quality free courses (e.g., Coursera, edX, YouTube, NPTEL).
  4. Provide expected salary ranges specifically for the Indian market (in INR).
  5. Maintain a friendly, supportive, and professional tone.
  6. Use Markdown for formatting (bolding, lists, etc.).
  
  Always focus on being practical and actionable for a college student.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
