const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Request failed');
    }

    return data.data as T;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    isAdmin?: boolean;
  }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  // Contributions
  async getContributions(filters?: {
    userId?: string;
    monthId?: string;
    status?: string;
  }) {
    const params = new URLSearchParams(filters as any);
    return this.request<any[]>(`/contributions?${params}`);
  }

  // Fetch every contribution from every member (no userId filter)
  async getAllContributions(filters?: { monthId?: string; status?: string }) {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters ?? {}).filter(([, v]) => v !== undefined && v !== '')
      )
    );
    return this.request<any[]>(`/contributions?${params}`);
  }

  async createContribution(data: {
    userId: string;
    amount: number;
    monthId: string;
    reference?: string;
  }) {
    return this.request<any>('/contributions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContribution(id: string) {
    return this.request<any>(`/contributions/${id}`);
  }

  // Verification (Admin)
  async getPendingContributions() {
    return this.request<any[]>('/verification/pending');
  }

  async verifyContribution(id: string) {
    return this.request<void>(`/verification/${id}/verify`, {
      method: 'POST',
    });
  }

  async rejectContribution(id: string, reason: string) {
    return this.request<void>(`/verification/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Equity
  async getEquity() {
    return this.request<{
      totalUnits: number;
      members: any[];
      calculatedAt: string;
    }>('/equity');
  }

  async getMemberEquity(userId: string) {
    return this.request<any>(`/equity/member/${userId}`);
  }

  // Months
  async getMonths() {
    return this.request<any[]>('/months');
  }

  async getCurrentMonth() {
    return this.request<any>('/months/current');
  }

  async createMonth(data: {
    year: number;
    month: number;
    minimumContribution: number;
  }) {
    return this.request<any>('/months', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async closeMonth(id: string) {
    return this.request<void>(`/months/${id}/close`, {
      method: 'PUT',
    });
  }

  async reopenMonth(id: string) {
    return this.request<void>(`/months/${id}/reopen`, {
      method: 'PUT',
    });
  }
}

export const apiService = new ApiService();
