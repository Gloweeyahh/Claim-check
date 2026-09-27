import { askForJSON } from './geminiClient.js';

const SYSTEM_PROMPT = `You help a health-literacy tool called CLAIMCHECK figure out how to research a health claim a user has typed in or pulled from a webpage.

Given the claim, produce:
- 2 to 4 short, specific search queries suitable for searching PubMed (scientific literature) and general health sites like WHO or CDC. Keep each query to a handful of plain keywords, not a full sentence.
- A one- or two-word claim type, e.g. "nutrition", "treatment", "prevention", "myth", "general wellness".

Respond with ONLY JSON in this exact shape, nothing else:
{"queries": ["...", "..."], "claimType": "..."}`;

export async function extractSearchTerms(claim) {
  try {
    const result = await askForJSON({
      system: SYSTEM_PROMPT,
      prompt: claim,
      maxTokens: 300,
    });
    if (!Array.isArray(result.queries) || result.queries.length === 0) {
      throw new Error('empty-queries');
    }
    return {
      queries: result.queries.slice(0, 4),
      claimType: result.claimType || 'general wellness',
    };
  } catch (err) {
    // Fall back to using the claim itself as the only search query, so a
    // hiccup in the AI layer doesn't stop evidence retrieval entirely.
    return { queries: [claim], claimType: 'general wellness' };
  }
}
