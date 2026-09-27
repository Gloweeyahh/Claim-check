import { fetchYouTubeContent } from './youtube.js';
import { scrapeGeneralPage } from './scraper.js';

const SOCIAL_HOSTS = ['facebook.com', 'instagram.com'];
const YOUTUBE_HOSTS = ['youtube.com', 'youtu.be'];

export async function handleContent(rawUrl) {
  let parsed;
  try {
    parsed = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
  } catch (err) {
    return { available: false, reason: 'invalid-url' };
  }

  if (SOCIAL_HOSTS.some((h) => parsed.hostname.includes(h))) {
    // Neither platform offers a public scraping API. Facebook/Instagram content
    // requires Graph API app review; there's no equivalent for arbitrary posts.
    return { available: false, reason: 'social-blocked' };
  }

  if (YOUTUBE_HOSTS.some((h) => parsed.hostname.includes(h))) {
    return fetchYouTubeContent(parsed);
  }

  return scrapeGeneralPage(parsed);
}
