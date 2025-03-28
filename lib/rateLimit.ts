/**
 * Enhanced Rate Limiting System
 * 
 * This module provides memory-based rate limiting with configurable options.
 * In production, it would be better to use a Redis-based implementation, but
 * for simplicity, we're using in-memory storage here.
 */

// Rate limiter configuration type
export interface RateLimiterConfig {
  name: string;
  limit: number;
  windowInSeconds: number;
  message: string;
}

// Rate limiter result interface
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  error?: {
    message: string;
    details?: any;
  };
}

// In-memory storage for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; reset: number }>();

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  // Use Array.from to convert map entries to array for iteration
  for (const [key, value] of Array.from(rateLimitStore.entries())) {
    if (value.reset < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Run every minute

// Pre-defined rate limiters
export const AUTH_RATE_LIMITER: RateLimiterConfig = {
  name: 'auth',
  limit: 10,
  windowInSeconds: 15 * 60, // 15 minutes
  message: 'Too many authentication attempts. Please try again later.',
};

export const API_RATE_LIMITER: RateLimiterConfig = {
  name: 'api',
  limit: 60,
  windowInSeconds: 60, // 1 minute
  message: 'Rate limit exceeded. Please slow down your requests.',
};

export const PUBLIC_RATE_LIMITER: RateLimiterConfig = {
  name: 'public',
  limit: 100,
  windowInSeconds: 60, // 1 minute
  message: 'Too many requests. Please try again later.',
};

/**
 * Apply rate limiting to a request
 * 
 * @param key - Unique identifier for the client (usually IP address)
 * @param limiter - Rate limiter configuration to use
 * @returns Result of the rate limiting check
 */
export async function rateLimit(
  key: string,
  limiter: RateLimiterConfig
): Promise<RateLimitResult> {
  // Create a unique key for this specific rate limiter
  const uniqueKey = `${limiter.name}:${key}`;
  const now = Date.now();
  
  // Get or create rate limit record
  let record = rateLimitStore.get(uniqueKey);
  if (!record) {
    record = {
      count: 0,
      reset: now + (limiter.windowInSeconds * 1000)
    };
    rateLimitStore.set(uniqueKey, record);
  }
  
  // Check if the window has expired and reset if needed
  if (record.reset <= now) {
    record.count = 0;
    record.reset = now + (limiter.windowInSeconds * 1000);
  }
  
  // Increment the counter
  record.count += 1;
  
  // Calculate remaining requests
  const remaining = Math.max(0, limiter.limit - record.count);
  
  // Check if rate limit is exceeded
  if (record.count > limiter.limit) {
    return {
      success: false,
      limit: limiter.limit,
      remaining,
      reset: record.reset,
      error: {
        message: limiter.message,
        details: {
          retryAfter: Math.ceil((record.reset - now) / 1000),
          windowInSeconds: limiter.windowInSeconds
        }
      }
    };
  }
  
  // Not rate limited
  return {
    success: true,
    limit: limiter.limit,
    remaining,
    reset: record.reset
  };
}

/**
 * Reset the rate limit counter for a specific key
 * 
 * @param key - The key to reset
 * @param limiterName - The name of the rate limiter (default: 'api')
 */
export async function resetRateLimitCounter(
  key: string,
  limiterName: string = 'api'
): Promise<void> {
  const uniqueKey = `${limiterName}:${key}`;
  rateLimitStore.delete(uniqueKey);
}

/**
 * Create Next.js API route middleware for rate limiting
 * 
 * @param options - Rate limiting options
 * @returns Middleware function
 */
export function createRateLimitMiddleware(options: RateLimiterConfig) {
  return async (req: any, res: any, next?: () => void) => {
    // Get IP address from the request
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',').shift() || 
               req.socket?.remoteAddress || 
               req.ip || 
               '0.0.0.0';
    
    // Use the IP as the rate limit key
    const key = options.name === 'auth' && req.body?.email 
      ? `${req.body.email}:${ip}` // Combine email and IP for auth endpoints
      : ip;
    
    // Apply rate limiting
    const result = await rateLimit(key, options);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', result.reset.toString());
    
    // If rate limited, return 429 response
    if (!result.success) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: result.error?.message || 'Rate limit exceeded',
        details: result.error?.details
      });
      return;
    }
    
    // Continue to next middleware/handler
    if (next) {
      next();
    }
  };
} 