export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  isAdmin?: boolean;
}

export interface RequestWithAuth extends Express.Request {
  user?: AuthPayload;
}
