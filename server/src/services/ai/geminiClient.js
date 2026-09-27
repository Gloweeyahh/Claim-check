import { GoogleGenAI } from '@google/genai';

let client = null;

export function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('missing-gemini-key');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// gemini-3.1-flash-lite: free-tier eligible, GA-stable, no shutdown scheduled
// (unlike gemini-2.5-flash, which is due to be retired October 2026).
export const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

/**
 * Sends a single-turn message and returns the parsed JSON from the response.
 * Strips ```json fences defensively in case the model adds them despite instructions.
 */
export async function askForJSON({ system, prompt, maxTokens = 800 }) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: system,
      maxOutputTokens: maxTokens,
    },
  });

  const text = response.text || '';
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
