import { Router } from 'express';
import { extractSearchTerms } from '../services/ai/claimAnalysis.js';
import { synthesizeAssessment } from '../services/ai/assessment.js';
import { searchPubMed } from '../services/evidence/pubmed.js';
import { searchWHOandCDC } from '../services/evidence/webHealthSources.js';

const router = Router();

router.post('/verify', async (req, res) => {
  const { claim } = req.body || {};
  if (!claim || !claim.trim()) {
    return res.status(400).json({ implemented: true, error: 'missing-claim' });
  }

  try {
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

    return res.json({
      implemented: true,
      claimType,
      evidenceCount: evidence.length,
      ...assessment,
      sources,
    });
  } catch (err) {
    console.error('verify error:', err.message);
    return res.status(500).json({ implemented: true, error: 'verify-failed' });
  }
});

export default router;
