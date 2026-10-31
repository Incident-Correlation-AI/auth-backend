import { Router, Request, Response } from 'express';
import {
  COOKIE_NAME,
  COOKIE_OPTIONS,
  verifyCredentials,
  issueToken,
  requireAuth,
} from './auth.js';

export const router = Router();

router.post(
  '/api/auth/login',
  async (req: Request, res: Response): Promise<void> => {
    const body: unknown = req.body;

    if (
      typeof body !== 'object' ||
      body === null ||
      !('username' in body) ||
      !('password' in body) ||
      typeof (body as Record<string, unknown>).username !== 'string' ||
      typeof (body as Record<string, unknown>).password !== 'string'
    ) {
      res.status(400).json({
        error: {
          code: 'bad_request',
          message: 'Username and password are required and must be strings',
        },
      });
      return;
    }

    const { username, password } = body as {
      username: string;
      password: string;
    };

    const isValid = await verifyCredentials(username, password);
    if (!isValid) {
      res.status(401).json({
        error: {
          code: 'invalid_credentials',
          message: 'Invalid username or password',
        },
      });
      return;
    }

    const token = issueToken(username);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.status(200).json({ ok: true, token });
  }
);

router.post('/api/auth/logout', (_req: Request, res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    ...COOKIE_OPTIONS,
    maxAge: undefined,
  });
  res.status(200).json({ ok: true });
});

router.get('/api/auth/me', requireAuth, (req: Request, res: Response): void => {
  res.status(200).json({
    user: {
      username: req.user?.username ?? '',
    },
  });
});

router.get(
  '/api/dashboard/ping',
  requireAuth,
  (_req: Request, res: Response): void => {
    res.status(200).json({ ok: true });
  }
);
