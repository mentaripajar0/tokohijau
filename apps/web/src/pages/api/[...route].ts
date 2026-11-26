import type { APIRoute } from 'astro';
import { apiApp } from '../../server/app';

const handle: APIRoute = (context) => {
  return apiApp.fetch(context.request, {
    env: context.locals.runtime?.env,
    user: context.locals.user ?? null,
    isAdmin: context.locals.isAdmin ?? false,
  });
};

export const ALL = handle;
