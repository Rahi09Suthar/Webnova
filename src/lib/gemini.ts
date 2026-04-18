import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export async function getBotResponse(userMessage, history) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: `You are a helpful, friendly AI chatbot for "Webnova". 
        Keep responses structured and clean.`,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "Try again!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops! Something went wrong 🤖";
  }
}