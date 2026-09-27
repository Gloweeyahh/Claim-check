import { getSupabaseClient } from './supabaseClient.js';

/**
 * Records one check for later analysis. Never throws — a logging failure
 * should never break the actual verify response the user is waiting on.
 */
export async function logCheck({ claim, sourceType, sourceDetail, claimType, verdict, headline, evidenceCount }) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('checks').insert({
      claim,
      source_type: sourceType,
      source_detail: sourceDetail,
      claim_type: claimType,
      verdict,
      headline,
      evidence_count: evidenceCount,
    });
  } catch (err) {
    console.error('logCheck failed:', err.message);
  }
}
