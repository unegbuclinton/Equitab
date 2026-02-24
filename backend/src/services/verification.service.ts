import { prisma } from '../config/prisma';
import { unitService } from './unit.service';
import { auditService } from './audit.service';

export class VerificationService {
  async verifyContribution(
    contributionId: string,
    adminId: string,
    decision: 'verified' | 'rejected',
    rejectionReason?: string
  ): Promise<void> {
    // Verify admin has permissions
    const admin = await prisma.admin.findUnique({
      where: { userId: adminId },
    });

    if (!admin) {
      throw new Error('User is not authorized as admin');
    }

    // Use Prisma transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Update contribution status
      const contribution = await tx.contribution.updateMany({
        where: {
          id: contributionId,
          status: 'pending',
        },
        data: {
          status: decision,
          verifiedBy: adminId,
          verifiedAt: new Date(),
          rejectionReason: rejectionReason || null,
        },
      });

      if (contribution.count === 0) {
        throw new Error('Contribution not found or already processed');
      }
      console.log(contribution,'Contribution verified successfully');

      // Log to audit trail
      await auditService.log({
        action: `contribution_${decision}`,
        entityType: 'contribution',
        entityId: contributionId,
        performedBy: adminId,
        details: { decision, rejectionReason },
      });

      // If verified, mint units automatically (pass transaction context)
      if (decision === 'verified') {
        await unitService.mintUnits(contributionId, tx);
      }
    });
  }

  async getPendingContributions() {
    return await prisma.contribution.findMany({
      where: {
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        month: true,
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}

export const verificationService = new VerificationService();
