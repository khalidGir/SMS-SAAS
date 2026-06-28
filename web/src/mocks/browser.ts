import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { parentHandlers } from './handlers/parent';
import { adminHandlers } from './handlers/admin';
import { accountantHandlers } from './handlers/accountant';
import { analyticsHandlers } from './handlers/analytics';

export const worker = setupWorker(
  ...authHandlers,
  ...parentHandlers,
  ...adminHandlers,
  ...accountantHandlers,
  ...analyticsHandlers,
);
