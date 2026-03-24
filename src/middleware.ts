import { defineMiddleware } from 'astro:middleware';

interface RateLimitEntry {
  count: number;
  reset: number;
}

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// In-memory store -- good enough for launch; swap for Redis later
const store = new Map<string, RateLimitEntry>();

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export const onRequest = defineMiddleware((context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  if (request.method === 'POST' && url.pathname === '/api/invite') {
    const ip = getClientIp(request);
    const now = Date.now();
    const entry = store.get(ip);

    if (entry && now < entry.reset) {
      if (entry.count >= RATE_LIMIT_MAX) {
        return new Response(JSON.stringify({ success: false, error: 'Too many requests' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      entry.count += 1;
    } else {
      store.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    }
  }

  return next();
});
