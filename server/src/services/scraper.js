import * as cheerio from 'cheerio';

export async function scrapeGeneralPage(parsedUrl) {
  let response;
  try {
    response = await fetch(parsedUrl.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ClaimCheckBot/0.1)' },
      redirect: 'follow',
    });
  } catch (err) {
    return { available: false, reason: 'fetch-failed' };
  }

  if (!response.ok) {
    return { available: false, reason: 'fetch-failed' };
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return { available: false, reason: 'not-html' };
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const title =
    $('title').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    '';
  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '';
  const bodyExcerpt = $('p')
    .slice(0, 5)
    .map((i, el) => $(el).text().trim())
    .get()
    .join(' ')
    .slice(0, 600);

  // Simple heuristic for now: the page title usually states the claim for
  // health-article content. Real claim extraction (picking it out of body
  // text when the title doesn't state it) is the AI layer's job next step.
  const claim = title || bodyExcerpt.split('.')[0] || '';
  if (!claim) {
    return { available: false, reason: 'no-content-found' };
  }

  return {
    available: true,
    claim,
    sourceType: 'webpage',
    sourceDetail: parsedUrl.hostname.replace(/^www\./, ''),
    raw: { title, description, bodyExcerpt },
  };
}
