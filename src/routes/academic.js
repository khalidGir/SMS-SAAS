import { Router } from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { requireRoles } from '../middleware/requireRoles.js';
import { withTenantContext } from '../middleware/withTenantContext.js';
import {
  createSession,
  listSessions,
  activateSession,
  createTerm,
} from '../controllers/academicController.js';

const router = Router();

router.use(authenticateJWT, withTenantContext);

router.post('/sessions', requireRoles('ADMIN', 'SUPER_ADMIN'), createSession);
router.get('/sessions', requireRoles('ADMIN', 'REGISTRAR', 'SUPER_ADMIN'), listSessions);
router.patch('/sessions/:id/activate', requireRoles('ADMIN', 'SUPER_ADMIN'), activateSession);
router.post('/terms', requireRoles('ADMIN', 'SUPER_ADMIN'), createTerm);

export default router;
