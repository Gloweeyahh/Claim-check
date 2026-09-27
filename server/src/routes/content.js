import { Router } from 'express';
import { handleContent } from '../services/contentHandler.js';

const router = Router();

router.post('/extract', async (req, res) => {
  const { url, claimText } = req.body || {};

  if (claimText && claimText.trim()) {
    return res.json({ available: true, claim: claimText.trim(), source: 'manual' });
  }

  if (!url || !url.trim()) {
    return res.status(400).json({ available: false, reason: 'missing-input' });
  }

  try {
    const result = await handleContent(url.trim());
    return res.json(result);
  } catch (err) {
    console.error('extract error:', err.message);
    return res.json({ available: false, reason: 'request-failed' });
  }
});

export default router;
