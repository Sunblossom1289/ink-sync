
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIWritingSuggestion = async (context, prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful writing assistant for a collaborative platform called InkSync. 
      Context: "${context}". 
      Request: "${prompt}". 
      Provide a short, creative suggestion that matches the tone.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("AI Error:", error);
    return "The muse is resting. Try again in a moment!";
  }
};
