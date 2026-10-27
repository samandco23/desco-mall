import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(url && token);

/**
 * Client Upstash. Non instancié si les variables sont absentes :
 * la plateforme reste fonctionnelle en local sans Redis.
 */
export const redis = isRedisConfigured
  ? new Redis({ url: url as string, token: token as string })
  : null;

export const REDIS_KEYS = {
  cart: (token: string) => `cart:${token}`,
  session: (id: string) => `session:${id}`,
  productViews: (id: string) => `views:product:${id}`,
  rateLimit: (ip: string) => `ratelimit:${ip}`,
} as const;

export const CART_TTL = 60 * 60 * 24 * 30; // 30 jours

/**
 * Rate limiting simple par fenêtre fixe (login, checkout).
 * Retourne `true` si la requête est autorisée.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  if (!redis) return true;
  try {
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, windowSeconds);
    return current <= limit;
  } catch (error) {
    console.error("[redis] rate limit indisponible", error);
    return true;
  }
}
