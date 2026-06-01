export interface LoginResult {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
}

export interface AuthService {
  login(): Promise<LoginResult>;
  logout(): Promise<void>;
}

export class AuthError extends Error {
  public readonly code: string;

  public constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}
