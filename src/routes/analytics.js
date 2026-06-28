import { Router } from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { requireRoles } from '../middleware/requireRoles.js';
import { withTenantContext } from '../middleware/withTenantContext.js';
import { getAnalyticsSummary } from '../controllers/analyticsController.js';

const router = Router();

router.use(authenticateJWT, withTenantContext);

router.get(
  '/summary',
  requireRoles('ACCOUNTANT', 'ADMIN', 'REGISTRAR', 'SUPER_ADMIN'),
  getAnalyticsSummary,
);

export default router;
