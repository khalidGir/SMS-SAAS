import { Router } from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { requireRoles } from '../middleware/requireRoles.js';
import { withTenantContext } from '../middleware/withTenantContext.js';
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
} from '../controllers/invoiceController.js';

const router = Router();

router.use(authenticateJWT, withTenantContext);

router.get('/', requireRoles('ACCOUNTANT', 'REGISTRAR', 'ADMIN'), listInvoices);
router.get('/:id', requireRoles('ACCOUNTANT', 'REGISTRAR', 'ADMIN'), getInvoice);
router.post('/', requireRoles('ACCOUNTANT', 'REGISTRAR', 'ADMIN'), createInvoice);
router.patch('/:id', requireRoles('ACCOUNTANT', 'ADMIN'), updateInvoice);

export default router;
