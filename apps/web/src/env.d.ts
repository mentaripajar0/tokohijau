/// <reference path="../.astro/types.d.ts" />
import type { Runtime } from '@astrojs/cloudflare';
import type { CloudflareEnv, SessionUser } from './types';

declare global {
  namespace App {
    interface Locals extends Runtime<CloudflareEnv> {
      user: SessionUser | null;
      isAdmin: boolean;
    }
  }
}
