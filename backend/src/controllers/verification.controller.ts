import { Response } from 'express';
import { RequestWithAuth } from '../middleware/auth';
import { verificationService } from '../services/verification.service';

// Helper function to get month name from month number
function getMonthName(monthNum: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[monthNum - 1] || 'Unknown';
}

// Helper function to add month name to contribution
function addMonthNameToContribution(contribution: any) {
  if (contribution.month) {
    return {
      ...contribution,
      month: {
        ...contribution.month,
        name: getMonthName(contribution.month.month)
      }
    };
  }
  return contribution;
}


export class VerificationController {
  async getPending(req: RequestWithAuth, res: Response) {
    try {
      const pending = await verificationService.getPendingContributions();

      // Add month name to each contribution
      const pendingWithMonthNames = pending.map(addMonthNameToContribution);

      res.json({
        success: true,
        data: pendingWithMonthNames,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async verify(req: RequestWithAuth, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id as string;

      await verificationService.verifyContribution(
        id,
        req.user.userId,
        'verified'
      );

      res.json({
        success: true,
        message: 'Contribution verified successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async reject(req: RequestWithAuth, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id as string;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Rejection reason is required',
        });
      }

      await verificationService.verifyContribution(
        id,
        req.user.userId,
        'rejected',
        reason
      );

      res.json({
        success: true,
        message: 'Contribution rejected',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export const verificationController = new VerificationController();
