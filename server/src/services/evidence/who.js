import * as cheerio from 'cheerio';
import { fetchWithTimeout } from '../fetchWithTimeout.js';

// WHO has no public search API for fact sheets. So this keeps a curated list
// of WHO fact-sheet pages (slug + trigger keywords), matches the claim against
// it, then fetches the matching page(s) live for their summary text.
// To add coverage, add a line to TOPICS — slug is the last part of the URL:
// https://www.who.int/news-room/fact-sheets/detail/<slug>
const TOPICS = [
  { slug: 'diabetes', keywords: ['diabetes', 'blood sugar', 'insulin', 'glucose'] },
  { slug: 'obesity-and-overweight', keywords: ['obesity', 'overweight', 'weight loss', 'fat', 'bmi'] },
  { slug: 'healthy-diet', keywords: ['diet', 'healthy eating', 'nutrition', 'fruit', 'vegetable', 'sugar', 'processed food'] },
  { slug: 'physical-activity', keywords: ['exercise', 'physical activity', 'workout', 'sedentary', 'fitness'] },
  { slug: 'hypertension', keywords: ['hypertension', 'blood pressure', 'salt', 'sodium'] },
  { slug: 'salt-reduction', keywords: ['salt', 'sodium'] },
  { slug: 'cardiovascular-diseases-(cvds)', keywords: ['heart', 'cardiovascular', 'stroke', 'cholesterol', 'heart attack'] },
  { slug: 'cancer', keywords: ['cancer', 'tumour', 'tumor', 'carcinogen', 'chemotherapy'] },
  { slug: 'depression', keywords: ['depression', 'depressed', 'low mood'] },
  { slug: 'mental-disorders', keywords: ['mental health', 'anxiety', 'schizophrenia', 'bipolar', 'mental disorder'] },
  { slug: 'suicide', keywords: ['suicide'] },
  { slug: 'dementia', keywords: ['dementia', 'alzheimer', 'memory loss'] },
  { slug: 'malaria', keywords: ['malaria', 'mosquito'] },
  { slug: 'dengue-and-severe-dengue', keywords: ['dengue'] },
  { slug: 'tuberculosis', keywords: ['tuberculosis', 'tb '] },
  { slug: 'hiv-aids', keywords: ['hiv', 'aids'] },
  { slug: 'cholera', keywords: ['cholera'] },
  { slug: 'typhoid', keywords: ['typhoid'] },
  { slug: 'measles', keywords: ['measles'] },
  { slug: 'poliomyelitis', keywords: ['polio'] },
  { slug: 'mpox', keywords: ['mpox', 'monkeypox'] },
  { slug: 'influenza-(seasonal)', keywords: ['flu', 'influenza'] },
  { slug: 'hepatitis-b', keywords: ['hepatitis b'] },
  { slug: 'hepatitis-c', keywords: ['hepatitis c'] },
  { slug: 'rabies', keywords: ['rabies'] },
  { slug: 'immunization-coverage', keywords: ['vaccine', 'vaccination', 'immunization', 'immunisation'] },
  { slug: 'antimicrobial-resistance', keywords: ['antibiotic', 'antimicrobial', 'superbug'] },
  { slug: 'tobacco', keywords: ['tobacco', 'smoking', 'cigarette', 'vaping', 'nicotine'] },
  { slug: 'alcohol', keywords: ['alcohol', 'drinking', 'wine', 'beer'] },
  { slug: 'breastfeeding', keywords: ['breastfeeding', 'breast milk', 'infant formula'] },
  { slug: 'infant-and-young-child-feeding', keywords: ['baby food', 'infant feeding', 'weaning', 'toddler'] },
  { slug: 'anaemia', keywords: ['anaemia', 'anemia', 'iron deficiency'] },
  { slug: 'malnutrition', keywords: ['malnutrition', 'stunting', 'undernutrition', 'vitamin deficiency'] },
  { slug: 'asthma', keywords: ['asthma', 'inhaler'] },
  { slug: 'chronic-obstructive-pulmonary-disease-(copd)', keywords: ['copd', 'emphysema', 'bronchitis'] },
  { slug: 'drinking-water', keywords: ['drinking water', 'tap water', 'water quality', 'alkaline water'] },
  { slug: 'food-safety', keywords: ['food safety', 'food poisoning', 'foodborne', 'raw food', 'expired food'] },
  { slug: 'oral-health', keywords: ['teeth', 'dental', 'tooth', 'gum disease', 'oral health'] },
  { slug: 'epilepsy', keywords: ['epilepsy', 'seizure'] },
  { slug: 'ebola-virus-disease', keywords: ['ebola'] },
  { slug: 'zika-virus', keywords: ['zika'] },
  { slug: 'pneumonia', keywords: ['pneumonia'] },
  { slug: 'cervical-cancer', keywords: ['cervical cancer', 'hpv'] },
  { slug: 'breast-cancer', keywords: ['breast cancer', 'mammogram'] },
  { slug: 'noncommunicable-diseases', keywords: ['chronic disease', 'noncommunicable', 'non-communicable'] },
  { slug: 'ageing-and-health', keywords: ['ageing', 'aging', 'elderly', 'anti-aging', 'longevity'] },
];

const CACHE_MS = 24 * 60 * 60 * 1000;
const cache = new Map(); // slug -> { at, item }

function pickTopics(text, max) {
  const t = ` ${text.toLowerCase()} `;
  return TOPICS
    .map((topic) => ({
      slug: topic.slug,
      score: topic.keywords.filter((k) => t.includes(k)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}

async function loadFactSheet(slug) {
  const hit = cache.get(slug);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.item;

  const url = `https://www.who.int/news-room/fact-sheets/detail/${slug}`;
  try {
    const res = await fetchWithTimeout(
      url,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ClaimCheckBot/0.1)' }, redirect: 'follow' },
      10000
    );
    if (!res.ok) {
      console.error('WHO fact sheet HTTP error:', res.status, slug);
      return null;
    }
    const $ = cheerio.load(await res.text());
    const title =
      $('meta[property="og:title"]').attr('content') || $('title').first().text().trim() || slug;
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('article p').first().text().trim() ||
      '';
    const item = {
      source: 'World Health Organization',
      title: title.replace(/\s*\|\s*World Health Organization.*$/i, '').trim(),
      snippet: description.replace(/\s+/g, ' ').slice(0, 500),
      url,
    };
    cache.set(slug, { at: Date.now(), item });
    return item;
  } catch (err) {
    console.error('WHO fact sheet fetch failed:', slug, err.message);
    return null;
  }
}

export async function searchWHO(text, maxResults = 2) {
  const picks = pickTopics(text, maxResults);
  if (picks.length === 0) return [];
  const items = await Promise.all(picks.map((p) => loadFactSheet(p.slug)));
  return items.filter(Boolean);
}
