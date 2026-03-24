// Simple in-memory rate limiter for API routes
const rateMap = new Map();

export function rateLimit({ windowMs = 60000, max = 30 } = {}) {
    return function checkRateLimit(identifier) {
        const now = Date.now();
        const key = identifier;

        if (!rateMap.has(key)) {
            rateMap.set(key, { count: 1, resetAt: now + windowMs });
            return { allowed: true, remaining: max - 1 };
        }

        const entry = rateMap.get(key);

        if (now > entry.resetAt) {
            entry.count = 1;
            entry.resetAt = now + windowMs;
            return { allowed: true, remaining: max - 1 };
        }

        entry.count++;
        if (entry.count > max) {
            return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
        }

        return { allowed: true, remaining: max - entry.count };
    };
}

// Pre-configured limiters
export const authLimiter = rateLimit({ windowMs: 60000, max: 10 }); // 10 req/min
export const apiLimiter = rateLimit({ windowMs: 60000, max: 30 });  // 30 req/min
export const submitLimiter = rateLimit({ windowMs: 60000, max: 5 }); // 5 req/min
