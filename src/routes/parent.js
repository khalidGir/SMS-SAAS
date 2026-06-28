import { Router } from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { requireRoles } from '../middleware/requireRoles.js';
import { withTenantContext } from '../middleware/withTenantContext.js';
import {
  getParentStudents,
  getParentInvoices,
  createParentPayment,
  confirmParentPayment,
} from '../controllers/parentController.js';

const router = Router();

router.use(authenticateJWT, withTenantContext);

router.get('/students', requireRoles('PARENT'), getParentStudents);
router.get('/invoices', requireRoles('PARENT'), getParentInvoices);
router.post('/payments', requireRoles('PARENT'), createParentPayment);
router.post('/payments/:id/confirm', requireRoles('PARENT'), confirmParentPayment);

export default router;
