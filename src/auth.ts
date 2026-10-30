import { Request, Response, NextFunction, CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { TokenPayload } from './types.js';

export const COOKIE_NAME = 'lad_session';

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.NODE_ENV === 'production',
  maxAge: config.SESSION_TTL_HOURS * 60 * 60 * 1000,
  path: '/',
};

export async function verifyCredentials(
  username: unknown,
  password: unknown
): Promise<boolean> {
  const isUsernameString = typeof username === 'string';
  const isPasswordString = typeof password === 'string';

  const passwordToCompare = isPasswordString ? password : '';
  const passwordMatches = await bcrypt.compare(
    passwordToCompare,
    config.ADMIN_PASSWORD_HASH
  );

  const usernameMatches = isUsernameString && username === config.ADMIN_USERNAME;
  return usernameMatches && passwordMatches;
}

export function issueToken(username: string): string {
  const payload: TokenPayload = {
    sub: username,
    username,
  };

  return jwt.sign(payload, config.SESSION_SECRET, {
    algorithm: 'HS256',
    expiresIn: config.SESSION_TTL_HOURS * 3600,
  });
}

export function readToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.SESSION_SECRET, {
      algorithms: ['HS256'],
    });

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'sub' in decoded &&
      typeof (decoded as Record<string, unknown>).sub === 'string' &&
      'username' in decoded &&
      typeof (decoded as Record<string, unknown>).username === 'string'
    ) {
      const record = decoded as Record<string, unknown>;
      return {
        sub: record.sub as string,
        username: record.username as string,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const token = cookies?.[COOKIE_NAME];

  if (typeof token !== 'string' || !token) {
    res.status(401).json({
      error: {
        code: 'unauthenticated',
        message: 'Authentication required',
      },
    });
    return;
  }

  const payload = readToken(token);
  if (!payload) {
    res.status(401).json({
      error: {
        code: 'unauthenticated',
        message: 'Authentication required',
      },
    });
    return;
  }

  req.user = payload;
  next();
}
