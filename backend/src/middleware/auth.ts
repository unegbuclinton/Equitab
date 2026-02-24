import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthPayload } from '../types';

export interface RequestWithAuth extends Request {
  user?: AuthPayload;
}

export const authenticate = (
  req: RequestWithAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};
