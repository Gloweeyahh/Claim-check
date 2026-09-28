import { askForJSON } from './geminiClient.js';

const SYSTEM_PROMPT = `You are the reasoning layer behind CLAIMCHECK, a tool that helps engineering students — not medical or health students — judge health claims they see online. Write for someone with no medical or scientific background: short sentences, everyday words, no jargon.

You'll be given a health claim and a list of evidence snippets gathered from PubMed and health authorities like WHO, CDC or NIH MedlinePlus.

Rules:
- Base your assessment ONLY on the evidence snippets given. Never introduce outside facts, studies, or sources that weren't provided.
- If the evidence list is empty, or too thin or unrelated to actually judge the claim, the verdict must be "unclear" — never guess.
- The verdict must be exactly one of: "supported", "unclear", "misleading".
- "headline" is a short, direct instruction to the reader about what to do next, e.g. "Hold off on sharing this", "This one checks out", "Don't share this".

Respond with ONLY JSON in this exact shape, nothing else:
{
  "verdict": "supported" | "unclear" | "misleading",
  "headline": "...",
  "tagline": "one short sentence expanding on the headline",
  "why": ["2 to 4 short, plain-language sentences explaining the reasoning"],
  "whatWeChecked": ["short phrases, e.g. 'The original claim', 'Scientific studies', 'Independent health sources'"],
  "evidenceSummary": [{"source": "...", "whatItSays": "plain-language restatement", "howItRelates": "plain-language link to the claim"}]
}
"evidenceSummary" should have one entry per evidence snippet given, in the same order.`;

export async function synthesizeAssessment(claim, evidence) {
  const prompt = JSON.stringify({ claim, evidence }, null, 2);

  try {
    return await askForJSON({ system: SYSTEM_PROMPT, prompt, maxTokens: 1000 });
  } catch (err) {
    // If the AI layer fails for any reason, fall back to an honest "unclear"
    // rather than showing nothing or crashing the request.
    return {
      verdict: 'unclear',
      headline: "We couldn't finish checking this",
      tagline: 'Something went wrong generating an assessment — treat this claim as unverified for now.',
      why: ['CLAIMCHECK ran into a problem putting the evidence together.'],
      whatWeChecked: ['The original claim'],
      evidenceSummary: evidence.map((e) => ({
        source: e.source,
        whatItSays: e.title || e.snippet || '',
        howItRelates: 'Not yet summarized.',
      })),
    };
  }
}
