import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Always use process.env.GEMINI_API_KEY for the Gemini API.
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function getBotResponse(userMessage: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: `You are a helpful, friendly AI chatbot for "Webnova". 
        Keep your responses professional, engaging, and highly structured.
        
        CRITICAL FORMATTING RULES:
        1. For any answer involving multiple steps, features, or points, ALWAYS use a list or bullet points.
        2. Every new point must start on a NEW LINE.
        3. Use bold text for headers or key terms (e.g., **Feature 1**).
        4. Use common emojis occasionally.
        5. Ensure the layout of the text is clean and easy to read at a glance.
        6. Avoid large blocks of text; break them up with line breaks.`,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response. Could you try asking again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops! Something went wrong on my end. Please check back in a moment. 🤖";
  }
}
