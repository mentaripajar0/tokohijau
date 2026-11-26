import { defineMiddleware } from 'astro:middleware';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://api.cloudinary.com https://upload.imagekit.io; frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
};

function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isAdminApiPath(pathname: string): boolean {
  return pathname === '/api/admin' || pathname.startsWith('/api/admin/');
}

export const onRequest = defineMiddleware(async (context, next) => {
  // shortcut: Better Auth Google SSO session resolution will populate user/isAdmin in auth slice
  context.locals.user = context.locals.user ?? null;
  context.locals.isAdmin = Boolean(context.locals.user?.role === 'admin' && context.locals.user.emailVerified);

  const { pathname } = context.url;

  if (isAdminApiPath(pathname)) {
    if (!context.locals.user) {
      return applySecurityHeaders(
        Response.json(
          { error: { code: 'UNAUTHORIZED', message: 'Silakan masuk terlebih dahulu.' } },
          { status: 401 },
        ),
      );
    }
    if (!context.locals.isAdmin) {
      return applySecurityHeaders(
        Response.json(
          { error: { code: 'FORBIDDEN', message: 'Akses ditolak. Khusus admin.' } },
          { status: 403 },
        ),
      );
    }
  }

  if (isAdminPath(pathname)) {
    if (!context.locals.user || !context.locals.isAdmin) {
      return applySecurityHeaders(
        new Response('Akses ditolak. Halaman ini khusus admin.', {
          status: 403,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }),
      );
    }
  }

  const response = await next();
  return applySecurityHeaders(response);
});
