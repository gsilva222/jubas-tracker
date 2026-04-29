import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accountsRouter from './routes/accounts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1337;  // ← usa 1337 como fallback

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/accounts', accountsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '🎉 Jubas Tracker API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Jubas Tracker API running at http://localhost:${PORT}`);
});