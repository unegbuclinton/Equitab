import { Response } from 'express';
import { RequestWithAuth } from '../middleware/auth';
import { equityService } from '../services/equity.service';

export class EquityController {
  async getAll(req: RequestWithAuth, res: Response) {
    try {
      const equity = await equityService.calculateEquity();

      res.json({
        success: true,
        data: equity,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getMember(req: RequestWithAuth, res: Response) {
    try {
      const userId = req.params.userId as string;

      const equity = await equityService.getMemberEquity(userId);

      res.json({
        success: true,
        data: equity,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export const equityController = new EquityController();
