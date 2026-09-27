const API_URL = import.meta.env.VITE_API_URL || '';

// The backend's own per-call timeouts (Gemini, PubMed, WHO/CDC) cap out at
// 45s total. This client-side timeout is a final safety net so the UI can
// never spin forever even if the server itself is unreachable (e.g. a cold
// Render free-tier instance that's slow to wake, or a dropped connection).
const CLIENT_TIMEOUT_MS = 55000;

/**
 * Runs the full verify pipeline: AI claim analysis, evidence retrieval
 * (PubMed + WHO/CDC), and AI assessment synthesis.
 */
export async function verifyClaim(claim) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim, sourceType: 'manual' }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Verify request failed (${res.status})`);
    }
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('verify-timeout');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
