/**
 * Authentication Service
 * 
 * Verwaltet Authentifizierung und Session-Management
 * (Aktuell als Stub für zukünftige Implementierung)
 */

import { apiClient, type ApiResponse } from '../api/client';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'de';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    alerts: boolean;
  };
  trading: {
    defaultStrategy: string;
    defaultPositionSize: number;
    riskPerTrade: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  private readonly basePath = '/auth';
  private currentUser: User | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  /**
   * Registriert einen neuen Benutzer
   */
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(
      `${this.basePath}/register`,
      data
    );

    if (response.data) {
      this.setSession(response.data);
    }

    return response;
  }

  /**
   * Meldet einen Benutzer an
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(
      `${this.basePath}/login`,
      credentials
    );

    if (response.data) {
      this.setSession(response.data);
    }

    return response;
  }

  /**
   * Meldet den aktuellen Benutzer ab
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/logout`);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Holt die Daten des aktuell angemeldeten Benutzers
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (this.currentUser) {
      return {
        data: this.currentUser,
        status: 200,
      };
    }

    const response = await apiClient.get<User>(`${this.basePath}/me`);
    
    if (response.data) {
      this.currentUser = response.data;
    }

    return response;
  }

  /**
   * Aktualisiert das Benutzerprofil
   */
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<User>(
      `${this.basePath}/profile`,
      data
    );

    if (response.data) {
      this.currentUser = response.data;
    }

    return response;
  }

  /**
   * Aktualisiert Benutzer-Präferenzen
   */
  async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<User>(
      `${this.basePath}/preferences`,
      preferences
    );

    if (response.data) {
      this.currentUser = response.data;
    }

    return response;
  }

  /**
   * Ändert das Passwort
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Fordert einen Passwort-Reset an
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/forgot-password`, { email });
  }

  /**
   * Setzt das Passwort mit einem Reset-Token zurück
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/reset-password`, {
      token,
      newPassword,
    });
  }

  /**
   * Erneuert den Access Token
   */
  async refreshAccessToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthTokens>(
      `${this.basePath}/refresh`,
      { refreshToken }
    );

    if (response.data) {
      this.storeTokens(response.data);
      this.scheduleTokenRefresh(response.data.expiresIn);
    }

    return response.data;
  }

  /**
   * Prüft, ob ein Benutzer angemeldet ist
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Holt den Access Token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Holt den Refresh Token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Speichert Tokens
   */
  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    apiClient.setAuthToken(tokens.accessToken);
  }

  /**
   * Setzt die Session nach erfolgreicher Authentifizierung
   */
  private setSession(authData: AuthResponse): void {
    this.currentUser = authData.user;
    this.storeTokens(authData.tokens);
    this.scheduleTokenRefresh(authData.tokens.expiresIn);
  }

  /**
   * Löscht die Session
   */
  private clearSession(): void {
    this.currentUser = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    apiClient.removeAuthToken();

    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Plant automatischen Token-Refresh
   */
  private scheduleTokenRefresh(expiresIn: number): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Refresh 5 Minuten vor Ablauf
    const refreshTime = (expiresIn - 300) * 1000;

    this.tokenRefreshTimer = setTimeout(async () => {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearSession();
        // Redirect zu Login könnte hier hinzugefügt werden
      }
    }, refreshTime);
  }

  /**
   * Prüft, ob ein Token abgelaufen ist
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }
}

// Singleton-Instanz
export const authService = new AuthService();
