import { Router } from 'express';
import multer from 'multer';
import { authController } from '../controllers/auth.controller';
import { contributionController } from '../controllers/contribution.controller';
import { verificationController } from '../controllers/verification.controller';
import { equityController } from '../controllers/equity.controller';
import { monthController } from '../controllers/month.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Auth routes (public)
router.post('/auth/register', (req, res) => authController.register(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));
router.get('/auth/me', authenticate, (req, res) =>
  authController.getProfile(req, res)
);

// Contribution routes (authenticated)
router.post('/contributions', authenticate, upload.single('receipt'), (req, res) =>
  contributionController.create(req, res)
);
router.get('/contributions', authenticate, (req, res) =>
  contributionController.getAll(req, res)
);
router.get('/contributions/:id', authenticate, (req, res) =>
  contributionController.getOne(req, res)
);

// Verification routes (admin only)
router.get('/verification/pending', authenticate, requireAdmin, (req, res) =>
  verificationController.getPending(req, res)
);
router.post('/verification/:id/verify', authenticate, requireAdmin, (req, res) =>
  verificationController.verify(req, res)
);
router.post('/verification/:id/reject', authenticate, requireAdmin, (req, res) =>
  verificationController.reject(req, res)
);

// Equity routes (authenticated)
router.get('/equity', authenticate, (req, res) =>
  equityController.getAll(req, res)
);
router.get('/equity/member/:userId', authenticate, (req, res) =>
  equityController.getMember(req, res)
);

// Month routes
router.post('/months', authenticate, requireAdmin, (req, res) =>
  monthController.create(req, res)
);
router.get('/months', authenticate, (req, res) =>
  monthController.getAll(req, res)
);
router.get('/months/current', authenticate, (req, res) =>
  monthController.getCurrent(req, res)
);
router.get('/months/:id', authenticate, (req, res) =>
  monthController.getOne(req, res)
);
router.put('/months/:id/close', authenticate, requireAdmin, (req, res) =>
  monthController.close(req, res)
);
router.put('/months/:id/reopen', authenticate, requireAdmin, (req, res) =>
  monthController.reopen(req, res)
);

export default router;
