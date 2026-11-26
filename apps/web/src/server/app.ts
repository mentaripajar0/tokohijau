import { Hono } from 'hono';
import type { CloudflareEnv, SessionUser } from '../types';

export interface ApiBindings {
  env: CloudflareEnv;
  user: SessionUser | null;
  isAdmin: boolean;
}

export function createApiApp() {
  const app = new Hono<{ Bindings: ApiBindings }>().basePath('/api');

  app.get('/health', (c) => {
    return c.json({
      ok: true,
      service: 'tokohijau-api',
      timestamp: Math.floor(Date.now() / 1000),
    });
  });

  // Lapis 2: Zero-trust admin guard inside Hono independent of Astro middleware
  app.use('/admin/*', async (c, next) => {
    const user = c.env?.user ?? null;
    const isAdmin = Boolean(c.env?.isAdmin && user?.role === 'admin' && user.emailVerified);

    if (!user) {
      return c.json(
        { error: { code: 'UNAUTHORIZED', message: 'Silakan masuk terlebih dahulu.' } },
        401,
      );
    }
    if (!isAdmin) {
      return c.json(
        { error: { code: 'FORBIDDEN', message: 'Akses ditolak. Khusus admin.' } },
        403,
      );
    }

    await next();
  });

  app.get('/admin/ping', (c) => {
    return c.json({ ok: true, role: 'admin' });
  });

  app.notFound((c) => {
    return c.json(
      { error: { code: 'NOT_FOUND', message: 'Endpoint tidak ditemukan.' } },
      404,
    );
  });

  app.onError((err, c) => {
    console.error('[API Error]', err);
    return c.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server.' } },
      500,
    );
  });

  return app;
}

export const apiApp = createApiApp();
