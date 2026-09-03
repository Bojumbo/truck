import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

import shiftRoutes from './routes/shifts.js';
import tachoRoutes from './routes/tacho.js';
import tripRoutes from './routes/trip.js';
import expenseRoutes from './routes/expenses.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Static Files (Vite build) ----
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// ---- Uploads folder ----
const uploadsPath = path.join(__dirname, '../../public/uploads');
app.use('/uploads', express.static(uploadsPath));

// ---- API Routes ----
app.use('/api/shifts', shiftRoutes);
app.use('/api/tacho', tachoRoutes);
app.use('/api/trip', tripRoutes);
app.use('/api/expenses', expenseRoutes);

// ---- Health Check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---- SPA Fallback (must be last) ----
app.get('{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ---- Error Handler ----
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ---- Start Server ----
async function startServer() {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      const { execSync } = await import('child_process');
      try {
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('✅ DB schema synced');
        execSync('node prisma/seed.js', { stdio: 'inherit' });
        console.log('✅ DB seeded');
      } catch (e) {
        console.warn('⚠️ Migration/seed warning:', e.message);
      }
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚛 TachoDrive server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
