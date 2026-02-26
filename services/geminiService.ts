import { GoogleGenAI } from "@google/genai";
import { Track } from "../types";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || ''; 

// Using a fallback mock if no key is present to prevent app crash for users testing without key
const hasKey = !!apiKey && apiKey !== 'undefined';

const ai = new GoogleGenAI({ apiKey });

export const getAIRecommendation = async (userHistory: Track[], query: string): Promise<string> => {
  if (!hasKey) {
    return new Promise(resolve => setTimeout(() => resolve("Connect your API Key to get personalized AI recommendations for new South African beats!"), 1000));
  }

  try {
    const model = 'gemini-3-flash-preview';
    
    const context = userHistory.length > 0 
      ? `User likes tracks like: ${userHistory.map(t => t.title + ' by ' + t.artist).join(', ')}.` 
      : "User is new to the platform.";

    const prompt = `
      You are a music expert AI for 'Melody Marketplace', a music app focused on South African and global music.
      ${context}
      The user asks: "${query}"
      Provide a short, punchy recommendation or answer (under 50 words). Focus on music vibes, genres (like Amapiano, Afro-beat, Deep House), or mood.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "I couldn't generate a recommendation right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the musical spirits (API Error).";
  }
};

export const suggestPrice = async (title: string, genre: string, artist: string): Promise<number> => {
  if (!hasKey) {
    return 150; // Default fallback
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      Suggest a price in South African Rand (ZAR) for a music track with the following details:
      Title: "${title}"
      Genre: "${genre}"
      Artist: "${artist}"
      
      Consider the market rates for independent artists in South Africa. 
      Return ONLY the number (integer), no currency symbol or text.
      Example: 150
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const price = parseInt(response.text?.trim() || '150', 10);
    return isNaN(price) ? 150 : price;
  } catch (error) {
    console.error("Gemini API Error (Price):", error);
    return 150;
  }
};