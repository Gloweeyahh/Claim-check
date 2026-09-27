import Anthropic from '@anthropic-ai/sdk';

let client = null;

export function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('missing-anthropic-key');
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

/**
 * Sends a single-turn message and returns the parsed JSON from the response.
 * Strips ```json fences defensively in case the model adds them despite instructions.
 */
export async function askForJSON({ system, prompt, maxTokens = 800 }) {
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
