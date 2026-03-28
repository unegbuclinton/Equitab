import { Response } from 'express';
import { RequestWithAuth } from '../middleware/auth';
import { contributionService } from '../services/contribution.service';
import { uploadToCloudinary } from '../utils/cloudinary';
import { emailService } from '../services/email.service';
import { prisma } from '../config/prisma';

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


export class ContributionController {
  async create(req: RequestWithAuth, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { userId, amount, monthId, reference } = req.body;

      if (!userId || !amount || !monthId) {
        return res.status(400).json({
          success: false,
          error: 'User ID, amount, and month ID are required',
        });
      }

      let fileUrl: string | undefined = undefined;

      // Handle file upload if present
      if (req.file) {
        try {
          fileUrl = await uploadToCloudinary(req.file.buffer);
        } catch (error) {
          console.error('File upload failed:', error);
          return res.status(500).json({
            success: false,
            error: 'Failed to upload file',
          });
        }
      }

      const contribution = await contributionService.createContribution({
        userId,
        amount: parseFloat(amount),
        monthId,
        reference,
        fileUrl,
        createdBy: req.user.userId,
      });

      // Send email to admins if created by non-admin
      if (!req.user.isAdmin) {
        try {
          const admins = await prisma.user.findMany({
            where: { admin: { isNot: null } },
            select: { email: true }
          });
          
          if (admins.length > 0) {
            const adminEmails = admins.map(a => a.email);
            const monthName = getMonthName(contribution.month.month);
            
            await emailService.sendContributionNotification(
              adminEmails,
              contribution.user.fullName,
              contribution.amount.toNumber(),
              monthName,
              contribution.month.year
            );
          }
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
          // Don't fail the request if email fails
        }
      }

      res.status(201).json({
        success: true,
        data: addMonthNameToContribution(contribution),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAll(req: RequestWithAuth, res: Response) {
    try {
      const { userId, monthId, status } = req.query;

      const contributions = await contributionService.getContributions({
        userId: userId as string | undefined,
        monthId: monthId as string | undefined,
        status: status as string | undefined,
      });

      // Add month name to each contribution
      const contributionsWithMonthNames = contributions.map(addMonthNameToContribution);

      res.json({
        success: true,
        data: contributionsWithMonthNames,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getOne(req: RequestWithAuth, res: Response) {
    try {
      const id = req.params.id as string;

      const contribution = await contributionService.getContribution(id);

      if (!contribution) {
        return res.status(404).json({
          success: false,
          error: 'Contribution not found',
        });
      }

      res.json({
        success: true,
        data: addMonthNameToContribution(contribution),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export const contributionController = new ContributionController();
