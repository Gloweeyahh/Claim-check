/**
 * fetch() with a hard timeout via AbortController. Used everywhere this
 * server calls an external API, so a slow or unresponsive third party
 * (PubMed, Google, a scraped webpage) can never hang a request forever —
 * it fails within `timeoutMs` and the caller's normal error handling takes over.
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
