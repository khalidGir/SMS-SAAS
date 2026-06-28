import app from './app.js';
import { scheduleLateFeeCron } from './services/lateFeeCron.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 SMS API server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/v1/health`);

  // Schedule the late fee cron job (daily at 00:05 UTC)
  scheduleLateFeeCron();
});
