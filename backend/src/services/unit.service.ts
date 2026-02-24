import { prisma } from '../config/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class UnitService {
  async mintUnits(contributionId: string, tx?: any) {
    // Use transaction client if provided, otherwise use global prisma
    const db = tx || prisma;

    // Get contribution details
    const contribution = await db.contribution.findFirst({
      where: {
        id: contributionId,
        status: 'verified',
      },
    });

    if (!contribution) {
      throw new Error('Contribution not found or not verified');
    }

    // Check if units already exist
    const existing = await db.unit.findUnique({
      where: { contributionId },
    });

    if (existing) {
      throw new Error('Units already minted for this contribution');
    }

    // Get unit value from config
    const config = await db.groupConfig.findFirst();
    if (!config) {
      throw new Error('Group configuration not found');
    }

    // Calculate units
    const amount = contribution.amount.toNumber();
    const unitValue = config.unitValue.toNumber();
    const unitsEarned = amount / unitValue;

    // Insert units (immutable)
    return await db.unit.create({
      data: {
        userId: contribution.userId,
        contributionId: contribution.id,
        unitsEarned: new Decimal(unitsEarned),
      },
    });
  }

  async getUserUnits(userId: string) {
    const units = await prisma.unit.findMany({
      where: { userId },
      include: {
        contribution: {
          include: {
            month: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalUnits = units.reduce(
      (sum, unit) => sum + unit.unitsEarned.toNumber(),
      0
    );

    return {
      units,
      totalUnits,
    };
  }
}

export const unitService = new UnitService();
