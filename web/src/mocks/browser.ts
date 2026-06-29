import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { parentHandlers } from './handlers/parent';
import { adminHandlers } from './handlers/admin';
import { billingHandlers } from './handlers/billing';
import { paymentHandlers } from './handlers/payments';
import { analyticsHandlers } from './handlers/analytics';
import { reportHandlers } from './handlers/reports';
import { notificationHandlers } from './handlers/notifications';
import { settingsHandlers } from './handlers/settings';

export const worker = setupWorker(
  ...authHandlers,
  ...parentHandlers,
  ...adminHandlers,
  ...billingHandlers,
  ...paymentHandlers,
  ...analyticsHandlers,
  ...reportHandlers,
  ...notificationHandlers,
  ...settingsHandlers,
);
