import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import invoiceRoutes from './routes/invoice.js';
import paymentRoutes from './routes/payment.js';
import analyticsRoutes from './routes/analytics.js';
import academicRoutes from './routes/academic.js';
import parentRoutes from './routes/parent.js';
import webhookRoutes from './routes/webhook.js';
import { authenticateJWT } from './middleware/authenticateJWT.js';
import { requireRoles } from './middleware/requireRoles.js';
import { executeLateFeeRun } from './services/lateFeeCron.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/payments/webhook', webhookRoutes);

// Manual trigger for late fee cron (admin only, dev convenience)
app.post('/api/v1/admin/run-late-fee', authenticateJWT, requireRoles('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const result = await executeLateFeeRun();
    res.json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: { code: 'CRON_ERROR', message: err.message },
    });
  }
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
});

export default app;
