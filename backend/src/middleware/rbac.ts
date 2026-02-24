import { Response, NextFunction } from 'express';
import { RequestWithAuth } from './auth';
import { prisma } from '../config/prisma';

export const requireAdmin = async (
  req: RequestWithAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { userId: req.user.userId },
    });

    if (!admin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to verify admin status',
    });
  }
};
