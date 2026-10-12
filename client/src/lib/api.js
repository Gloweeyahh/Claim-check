const API_URL = import.meta.env.VITE_API_URL || '';


const CLIENT_TIMEOUT_MS = 55000;


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
