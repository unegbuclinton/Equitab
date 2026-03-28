import { prisma } from '../config/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class ContributionService {
  async createContribution(data: {
    userId: string;
    amount: number;
    monthId: string;
    reference?: string;
    fileUrl?: string;
    createdBy: string;
  }) {
    // Get month to check minimum contribution
    const month = await prisma.month.findUnique({
      where: { id: data.monthId },
    });

    if (!month) {
      throw new Error('Month not found');
    }

    if (month.isClosed) {
      throw new Error('Cannot add contributions to a closed month');
    }

    if (data.amount < month.minimumContribution.toNumber()) {
      throw new Error(
        `Amount must be at least ${month.minimumContribution.toString()}`
      );
    }

    return await prisma.contribution.create({
      data: {
        userId: data.userId,
        amount: new Decimal(data.amount),
        monthId: data.monthId,
        reference: data.reference,
        fileUrl: data.fileUrl,
        createdBy: data.createdBy,
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
      },
    });
  }

  async getContributions(filters?: {
    userId?: string;
    monthId?: string;
    status?: string;
  }) {
    return await prisma.contribution.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        month: true,
        verifier: {
          select: {
            id: true,
            fullName: true,
          },
        },
        unit: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getContribution(id: string) {
    return await prisma.contribution.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        month: true,
        verifier: {
          select: {
            id: true,
            fullName: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        unit: true,
      },
    });
  }
}

export const contributionService = new ContributionService();
