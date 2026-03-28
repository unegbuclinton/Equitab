import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthPayload } from '../types';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    isAdmin?: boolean;
  }) {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
      },
    });
  
    // If admin, create admin record
    if (data.isAdmin) {
      await prisma.admin.create({
        data: {
          userId: user.id,
          role: 'admin',
        },
      });
    }

    // Generate token
    const token = this.generateToken({ 
      userId: user.id, 
      email: user.email,
      isAdmin: data.isAdmin || false
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: data.isAdmin || false,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({ 
      userId: user.id, 
      email: user.email,
      isAdmin: !!user.admin
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: !!user.admin,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        admin: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isAdmin: !!user.admin,
      createdAt: user.createdAt,
    };
  }

  private generateToken(payload: AuthPayload): string {
    return jwt.sign({ ...payload }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
  }
}

export const authService = new AuthService();
