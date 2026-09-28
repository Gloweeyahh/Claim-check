import { fetchWithTimeout } from '../fetchWithTimeout.js';

// CDC Content Services API — public, no key.
// Docs: https://tools.cdc.gov/api/docs/info.aspx
const BASE = 'https://tools.cdc.gov/api/v2/resources/media';

function stripTags(s = '') {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function searchCDC(query, maxResults = 2) {
  try {
    // Ask for extra results, then keep only real cdc.gov pages with text.
    const url = `${BASE}?q=${encodeURIComponent(query)}&max=${maxResults * 4}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      console.error('CDC HTTP error:', res.status);
      return [];
    }
    const data = await res.json();
    const items = data?.results || [];

    return items
      .map((item) => ({
        source: 'CDC',
        title: item.name || item.title,
        snippet: stripTags(item.description || '').slice(0, 500),
        url: item.sourceUrl || item.targetUrl,
      }))
      .filter((x) => x.title && x.url && /cdc\.gov/i.test(x.url))
      .slice(0, maxResults);
  } catch (err) {
    console.error('CDC search failed:', err.message);
    return [];
  }
}
