import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import verifyRoutes from './routes/verify.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} — Origin: ${req.headers.origin || 'none'}`);
  next();
});

app.use('/api', verifyRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CLAIMCHECK server running on http://localhost:${PORT}`);
});
