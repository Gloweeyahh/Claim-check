function labelSource(url) {
  if (url.includes('who.int')) return 'World Health Organization';
  if (url.includes('cdc.gov')) return 'CDC';
  return 'Health authority';
}

export async function searchWHOandCDC(query, maxResults = 2) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cseId) {
    // Not configured — verify still works with PubMed alone.
    return [];
  }

  try {
    const restrictedQuery = `${query} (site:who.int OR site:cdc.gov)`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&num=${maxResults}&q=${encodeURIComponent(restrictedQuery)}`;
    const res = await fetch(url);
    const data = await res.json();
    const items = data.items || [];

    return items.map((item) => ({
      source: labelSource(item.link),
      title: item.title,
      snippet: item.snippet,
      url: item.link,
    }));
  } catch (err) {
    console.error('WHO/CDC search failed:', err.message);
    return [];
  }
}
