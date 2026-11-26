import { describe, expect, it } from 'vitest';
import { createApiApp } from '../src/server/app';
import type { CloudflareEnv } from '../src/types';

const dummyEnv = {} as CloudflareEnv;

describe('TokoHijau API & Admin Security Boundary', () => {
  const app = createApiApp();

  it('returns 200 on GET /api/health', async () => {
    const res = await app.fetch(new Request('https://tokohijau.test/api/health'), {
      env: dummyEnv,
      user: null,
      isAdmin: false,
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; service: string };
    expect(body.ok).toBe(true);
    expect(body.service).toBe('tokohijau-api');
  });

  it('rejects unauthenticated access to /api/admin/* with 401', async () => {
    const res = await app.fetch(new Request('https://tokohijau.test/api/admin/ping'), {
      env: dummyEnv,
      user: null,
      isAdmin: false,
    });
    expect(res.status).toBe(401);
  });

  it('rejects non-admin customer access to /api/admin/* with 403', async () => {
    const res = await app.fetch(new Request('https://tokohijau.test/api/admin/ping'), {
      env: dummyEnv,
      user: {
        id: 'u1',
        email: 'buyer@example.com',
        name: 'Buyer',
        emailVerified: true,
        role: 'customer',
      },
      isAdmin: false,
    });
    expect(res.status).toBe(403);
  });

  it('rejects unverified admin email on /api/admin/* with 403', async () => {
    const res = await app.fetch(new Request('https://tokohijau.test/api/admin/ping'), {
      env: dummyEnv,
      user: {
        id: 'a1',
        email: 'admin@example.com',
        name: 'Admin',
        emailVerified: false,
        role: 'admin',
      },
      isAdmin: true,
    });
    expect(res.status).toBe(403);
  });

  it('allows verified admin on /api/admin/ping with 200', async () => {
    const res = await app.fetch(new Request('https://tokohijau.test/api/admin/ping'), {
      env: dummyEnv,
      user: {
        id: 'a1',
        email: 'admin@example.com',
        name: 'Admin',
        emailVerified: true,
        role: 'admin',
      },
      isAdmin: true,
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; role: string };
    expect(body).toEqual({ ok: true, role: 'admin' });
  });
});
