export interface Config {
  PORT: number;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD_HASH: string;
  SESSION_SECRET: string;
  SESSION_TTL_HOURS: number;
  FRONTEND_ORIGIN: string;
  NODE_ENV: 'development' | 'production';
}

export interface TokenPayload {
  sub: string;
  username: string;
}

export type ApiErrorCode =
  | 'invalid_credentials'
  | 'unauthenticated'
  | 'bad_request'
  | 'rate_limited'
  | 'internal_error';

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
