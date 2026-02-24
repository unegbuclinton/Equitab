import { prisma } from '../config/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { auditService } from './audit.service';

export class MonthService {
  async createMonth(data: {
    year: number;
    month: number;
    minimumContribution: number;
  }) {
    // Check if month already exists
    const existing = await prisma.month.findUnique({
      where: {
        year_month: {
          year: data.year,
          month: data.month,
        },
      },
    });

    if (existing) {
      throw new Error('Month already exists');
    }

    return await prisma.month.create({
      data: {
        year: data.year,
        month: data.month,
        minimumContribution: new Decimal(data.minimumContribution),
        isClosed: false,
      },
    });
  }

  async closeMonth(monthId: string, adminId: string): Promise<void> {
    // Verify admin permissions
    const admin = await prisma.admin.findUnique({
      where: { userId: adminId },
    });

    if (!admin) {
      throw new Error('User is not authorized as admin');
    }

    // Check if already closed
    const month = await prisma.month.findUnique({
      where: { id: monthId },
    });

    if (!month) {
      throw new Error('Month not found');
    }

    if (month.isClosed) {
      throw new Error('Month already closed');
    }

    // Check for pending contributions
    const pendingCount = await prisma.contribution.count({
      where: {
        monthId,
        status: 'pending',
      },
    });

    if (pendingCount > 0) {
      throw new Error('Cannot close month with pending contributions');
    }

    // Close the month
    await prisma.month.update({
      where: { id: monthId },
      data: {
        isClosed: true,
        closedAt: new Date(),
        closedBy: adminId,
      },
    });

    // Audit log
    await auditService.log({
      action: 'month_closed',
      entityType: 'month',
      entityId: monthId,
      performedBy: adminId,
    });
  }

  async reopenMonth(monthId: string, adminId: string): Promise<void> {
    // Verify admin permissions
    const admin = await prisma.admin.findUnique({
      where: { userId: adminId },
    });

    if (!admin) {
      throw new Error('User is not authorized as admin');
    }

    const month = await prisma.month.findUnique({
      where: { id: monthId },
    });

    if (!month) {
      throw new Error('Month not found');
    }

    if (!month.isClosed) {
      throw new Error('Month is not closed');
    }

    // Reopen the month
    await prisma.month.update({
      where: { id: monthId },
      data: {
        isClosed: false,
        closedAt: null,
        closedBy: null,
      },
    });

    // Audit log
    await auditService.log({
      action: 'month_reopened',
      entityType: 'month',
      entityId: monthId,
      performedBy: adminId,
    });
  }

  async getMonths() {
    return await prisma.month.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });
  }

  async getMonth(id: string) {
    return await prisma.month.findUnique({
      where: { id },
      include: {
        contributions: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getCurrentMonth() {
    const now = new Date();
    return await prisma.month.findUnique({
      where: {
        year_month: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      },
    });
  }
}

export const monthService = new MonthService();
