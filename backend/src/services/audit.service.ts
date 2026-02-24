import { prisma } from '../config/prisma';

interface AuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  details?: any;
}

export class AuditService {
  async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          performedBy: data.performedBy,
          details: data.details || null,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging failures shouldn't break operations
    }
  }

  async getEntityHistory(entityType: string, entityId: string) {
    return await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        performer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllLogs(limit: number = 100, offset: number = 0) {
    return await prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      include: {
        performer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const auditService = new AuditService();
