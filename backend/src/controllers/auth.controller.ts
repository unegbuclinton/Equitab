import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { RequestWithAuth } from '../middleware/auth';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, isAdmin } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and full name are required',
        });
      }

      const result = await authService.register({
        email,
        password,
        fullName,
        isAdmin: isAdmin || false,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {

      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getProfile(req: RequestWithAuth, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const profile = await authService.getProfile(req.user.userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export const authController = new AuthController();
