import { Router } from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { requireRoles } from '../middleware/requireRoles.js';
import { withTenantContext } from '../middleware/withTenantContext.js';
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
} from '../controllers/studentController.js';

const router = Router();

// All student routes require authentication + tenant context
router.use(authenticateJWT, withTenantContext);

router.get('/', requireRoles('ADMIN', 'REGISTRAR'), listStudents);
router.get('/:id', requireRoles('ADMIN', 'REGISTRAR'), getStudent);
router.post('/', requireRoles('ADMIN', 'REGISTRAR'), createStudent);
router.patch('/:id', requireRoles('ADMIN'), updateStudent);
router.patch('/:id/status', requireRoles('ADMIN', 'REGISTRAR'), updateStudentStatus);
router.delete('/:id', requireRoles('ADMIN'), deleteStudent);

export default router;
