import { Router } from 'express';
import { extractSearchTerms } from '../services/ai/claimAnalysis.js';
import { synthesizeAssessment } from '../services/ai/assessment.js';
import { searchPubMed } from '../services/evidence/pubmed.js';
import { searchWHOandCDC } from '../services/evidence/webHealthSources.js';
import { logCheck } from '../services/db/logCheck.js';

const router = Router();

// Belt-and-braces on top of the per-call timeouts already inside
// claimAnalysis/pubmed/webHealthSources/assessment: even if something in
// there misbehaves, the whole request still fails within 45s instead of
// hanging indefinitely.
const OVERALL_TIMEOUT_MS = 45000;

async function runVerifyPipeline(claim, sourceType, sourceDetail) {
  const { queries, claimType } = await extractSearchTerms(claim);

  // Run PubMed + WHO/CDC searches for each query in parallel, then flatten
  // and cap the total so the AI synthesis prompt stays a reasonable size.
  const searchPromises = queries
    .slice(0, 3)
    .flatMap((q) => [searchPubMed(q), searchWHOandCDC(q)]);
  const evidenceArrays = await Promise.all(searchPromises);
  const evidence = evidenceArrays.flat().slice(0, 6);

  const assessment = await synthesizeAssessment(claim, evidence);

  const sources = evidence.map((e) => ({
    name: e.title ? `${e.source}: ${e.title}` : e.source,
    url: e.url,
  }));

  // Fire-and-forget: logging failures should never affect the response
  // the user is waiting on.
  logCheck({
    claim,
    sourceType,
    sourceDetail,
    claimType,
    verdict: assessment.verdict,
    headline: assessment.headline,
    evidenceCount: evidence.length,
  });

  return {
    implemented: true,
    claimType,
    evidenceCount: evidence.length,
    ...assessment,
    sources,
  };
}

router.post('/verify', async (req, res) => {
  const { claim, sourceType, sourceDetail } = req.body || {};
  if (!claim || !claim.trim()) {
    return res.status(400).json({ implemented: true, error: 'missing-claim' });
  }

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('verify-timeout')), OVERALL_TIMEOUT_MS)
  );

  try {
    const result = await Promise.race([runVerifyPipeline(claim, sourceType, sourceDetail), timeout]);
    return res.json(result);
  } catch (err) {
    console.error('verify error:', err.message);
    const errorCode = err.message === 'verify-timeout' ? 'verify-timeout' : 'verify-failed';
    return res.status(500).json({ implemented: true, error: errorCode });
  }
});

export default router;
