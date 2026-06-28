import { Router } from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import {
  login,
  refresh,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/authController.js';

const router = Router();

// POST /api/v1/auth/login       — Authenticate and receive access token
// POST /api/v1/auth/refresh      — Exchange refresh token for new access token
// POST /api/v1/auth/forgot-password — Request password reset link
// POST /api/v1/auth/reset-password  — Reset password with token
// POST /api/v1/auth/logout       — Clear refresh token cookie

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', authenticateJWT, logout);

export default router;
