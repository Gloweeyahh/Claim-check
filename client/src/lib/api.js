const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Sends a URL to the backend for content extraction.
 * Returns { available, claim, sourceType, sourceDetail } on success,
 * or { available: false, reason } when the content couldn't be retrieved
 * (e.g. Facebook/Instagram, or a page that blocked the request).
 */
export async function extractFromUrl(url) {
  const res = await fetch(`${API_URL}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    throw new Error(`Extraction request failed (${res.status})`);
  }
  return res.json();
}

/**
 * Runs the full verify pipeline: AI claim analysis, evidence retrieval
 * (PubMed + WHO/CDC), and AI assessment synthesis. sourceType/sourceDetail
 * are passed through only so the backend can log them for later analysis —
 * they don't affect the assessment itself.
 */
export async function verifyClaim(claim, sourceType, sourceDetail) {
  const res = await fetch(`${API_URL}/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim, sourceType, sourceDetail }),
  });
  if (!res.ok) {
    throw new Error(`Verify request failed (${res.status})`);
  }
  return res.json();
}
