import { Router } from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { requireRoles } from '../middleware/requireRoles.js';
import { withTenantContext } from '../middleware/withTenantContext.js';
import { createPayment, listPayments, voidPayment } from '../controllers/paymentController.js';

const router = Router();

router.use(authenticateJWT, withTenantContext);

router.post('/', requireRoles('ACCOUNTANT'), createPayment);
router.get('/', requireRoles('ACCOUNTANT', 'ADMIN', 'REGISTRAR'), listPayments);
router.post('/:id/void', requireRoles('ADMIN'), voidPayment);

export default router;
