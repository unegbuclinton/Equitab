import { prisma } from '../config/prisma';

interface EquitySnapshot {
  totalUnits: number;
  members: Array<{
    userId: string;
    fullName: string;
    email: string;
    memberUnits: number;
    equityPercentage: number;
  }>;
  calculatedAt: Date;
}

interface MemberEquity {
  userId: string;
  name: string;
  totalUnits: number;
  equityPercentage: number;
}

export class EquityService {
  async calculateEquity(): Promise<EquitySnapshot> {
    // Get total units across all users
    const totalUnitsResult = await prisma.unit.aggregate({
      _sum: {
        unitsEarned: true,
      },
    });

    const totalUnits = totalUnitsResult._sum.unitsEarned?.toNumber() || 0;

    // Get units per user with details (excluding admins from equity)
    const users = await prisma.user.findMany({
      include: {
        units: true,
      },
    });

    const members = users
      .map((user) => {
        const memberUnits = user.units.reduce(
          (sum, unit) => sum + unit.unitsEarned.toNumber(),
          0
        );

        return {
          userId: user.id,
          fullName: user.fullName,
          email: user.email,
          memberUnits,
          equityPercentage:
            totalUnits > 0 ? (memberUnits / totalUnits) * 100 : 0,
        };
      })
      .sort((a, b) => b.memberUnits - a.memberUnits);

    return {
      totalUnits,
      members,
      calculatedAt: new Date(),
    };
  }

  async getMemberEquity(userId: string): Promise<MemberEquity> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        units: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const memberUnits = user.units.reduce(
      (sum, unit) => sum + unit.unitsEarned.toNumber(),
      0
    );

    const totalUnitsResult = await prisma.unit.aggregate({
      _sum: {
        unitsEarned: true,
      },
    });

    const totalUnits = totalUnitsResult._sum.unitsEarned?.toNumber() || 0;

    return {
      userId: user.id,
      name: user.fullName,
      totalUnits: memberUnits,
      equityPercentage: totalUnits > 0 ? (memberUnits / totalUnits) * 100 : 0,
    };
  }
}

export const equityService = new EquityService();
