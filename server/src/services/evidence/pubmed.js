const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

function withKey(url) {
  return process.env.NCBI_API_KEY ? `${url}&api_key=${process.env.NCBI_API_KEY}` : url;
}

export async function searchPubMed(query, maxResults = 3) {
  try {
    const searchUrl = withKey(
      `${BASE}/esearch.fcgi?db=pubmed&retmode=json&retmax=${maxResults}&sort=relevance&term=${encodeURIComponent(query)}`
    );
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const ids = searchData?.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const summaryUrl = withKey(`${BASE}/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`);
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    return ids
      .map((id) => summaryData?.result?.[id])
      .filter(Boolean)
      .map((item) => ({
        source: 'PubMed',
        title: item.title,
        year: (item.pubdate || '').slice(0, 4),
        url: `https://pubmed.ncbi.nlm.nih.gov/${item.uid}/`,
      }));
  } catch (err) {
    console.error('PubMed search failed:', err.message);
    return [];
  }
}
