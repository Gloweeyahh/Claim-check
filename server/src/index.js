import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import verifyRoutes from './routes/verify.js';

const app = express();

// In production, set FRONTEND_URL to your deployed Netlify URL so only your
// own frontend can call this API. Left unset (local dev), it allows all origins.
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api', verifyRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CLAIMCHECK server running on http://localhost:${PORT}`);
});
