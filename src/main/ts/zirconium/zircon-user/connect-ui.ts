import { AuthService } from './connect';

export interface UserConnect {
  getId: () => string;
  getAuthService: () => AuthService;
  start: () => Promise<void>;
}
