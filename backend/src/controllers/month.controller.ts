import { Response } from 'express';
import { RequestWithAuth } from '../middleware/auth';
import { monthService } from '../services/month.service';

// Helper function to get month name from month number
function getMonthName(monthNum: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[monthNum - 1] || 'Unknown';
}

export class MonthController {
  async create(req: RequestWithAuth, res: Response) {
    try {
      const { year, month, minimumContribution } = req.body;

      if (!year || !month || !minimumContribution) {
        return res.status(400).json({
          success: false,
          error: 'Year, month, and minimum contribution are required',
        });
      }

      const newMonth = await monthService.createMonth({
        year: parseInt(year),
        month: parseInt(month),
        minimumContribution: parseFloat(minimumContribution),
      });

      res.status(201).json({
        success: true,
        data: {
          ...newMonth,
          name: getMonthName(newMonth.month)
        },
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
      const months = await monthService.getMonths();

      // Add month name to each month object
      const monthsWithNames = months.map(month => ({
        ...month,
        name: getMonthName(month.month)
      }));

      res.json({
        success: true,
        data: monthsWithNames,
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

      const month = await monthService.getMonth(id);

      if (!month) {
        return res.status(404).json({
          success: false,
          error: 'Month not found',
        });
      }

      res.json({
        success: true,
        data: {
          ...month,
          name: getMonthName(month.month)
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async close(req: RequestWithAuth, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id as string;

      await monthService.closeMonth(id, req.user.userId);

      res.json({
        success: true,
        message: 'Month closed successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async reopen(req: RequestWithAuth, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const id = req.params.id as string;

      await monthService.reopenMonth(id, req.user.userId);

      res.json({
        success: true,
        message: 'Month reopened successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getCurrent(req: RequestWithAuth, res: Response) {
    try {
      const month = await monthService.getCurrentMonth();

      if (!month) {
        return res.status(404).json({
          success: false,
          error: 'No month found for current period',
        });
      }

      res.json({
        success: true,
        data: {
          ...month,
          name: getMonthName(month.month)
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export const monthController = new MonthController();
