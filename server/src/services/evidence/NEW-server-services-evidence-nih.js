import { fetchWithTimeout } from '../fetchWithTimeout.js';

// NIH MedlinePlus Web Service — free, no key, no registration.
// Docs: https://medlineplus.gov/about/developers/webservices/
const BASE = 'https://wsearch.nlm.nih.gov/ws/query';

function stripTags(s = '') {
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function field(block, name) {
  const m = block.match(new RegExp(`<content name="${name}">([\\s\\S]*?)</content>`, 'i'));
  return m ? stripTags(m[1]) : '';
}

export async function searchMedlinePlus(query, maxResults = 2) {
  try {
    const url = `${BASE}?db=healthTopics&term=${encodeURIComponent(query)}&retmax=${maxResults}&tool=claimcheck`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      console.error('MedlinePlus HTTP error:', res.status);
      return [];
    }
    const xml = await res.text();
    const docs = xml.match(/<document\b[\s\S]*?<\/document>/gi) || [];

    return docs
      .slice(0, maxResults)
      .map((block) => {
        const urlMatch = block.match(/<document[^>]*\burl="([^"]+)"/i);
        const summary = field(block, 'FullSummary') || field(block, 'snippet');
        return {
          source: 'NIH MedlinePlus',
          title: field(block, 'title'),
          snippet: summary.slice(0, 500),
          url: urlMatch ? urlMatch[1] : undefined,
        };
      })
      .filter((x) => x.title && x.url);
  } catch (err) {
    console.error('MedlinePlus search failed:', err.message);
    return [];
  }
}
