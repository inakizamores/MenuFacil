import { NextRequest, NextResponse } from 'next/server';
import { handleRateLimitError } from './error-handler';

interface RateLimitConfig {
  // Number of requests allowed per window
  limit: number;
  // Time window in seconds
  windowSizeInSeconds: number;
  // Optional key function to determine the rate limit key (defaults to IP)
  keyGenerator?: (req: NextRequest) => string;
  // Optional skip function to bypass rate limiting for certain requests
  shouldSkip?: (req: NextRequest) => boolean;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory cache for rate limiting
// In production, this should be replaced with Redis or similar
const rateLimitCache = new Map<string, RateLimitRecord>();

// Clean up expired rate limit records periodically
function cleanupRateLimitCache() {
  const now = Date.now();
  
  // Use Array.from to convert iterator to array for TypeScript compatibility
  Array.from(rateLimitCache.entries()).forEach(([key, record]) => {
    if (record.resetAt <= now) {
      rateLimitCache.delete(key);
    }
  });
}

// Set up periodic cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitCache, 5 * 60 * 1000);
}

/**
 * Get IP address from request
 */
function getIpAddress(req: NextRequest): string {
  // Try getting IP from Vercel-specific headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Try getting IP from standard headers
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a placeholder for local development
  return 'LOCAL_DEVELOPMENT';
}

/**
 * Check if request exceeds rate limit
 */
export function isRateLimited(req: NextRequest, config: RateLimitConfig): boolean {
  // If skip function is provided and returns true, bypass rate limiting
  if (config.shouldSkip && config.shouldSkip(req)) {
    return false;
  }
  
  // Generate key for rate limiting
  const key = config.keyGenerator ? config.keyGenerator(req) : getIpAddress(req);
  
  // Get current time in milliseconds
  const now = Date.now();
  
  // Get or initialize rate limit record
  let record = rateLimitCache.get(key);
  if (!record || record.resetAt <= now) {
    // Initialize new record if none exists or existing one has expired
    record = {
      count: 1,
      resetAt: now + (config.windowSizeInSeconds * 1000)
    };
    rateLimitCache.set(key, record);
    return false;
  } 
  
  // Increment request count
  record.count += 1;
  
  // Check if limit exceeded
  if (record.count > config.limit) {
    return true;
  }
  
  return false;
}

/**
 * Rate limit middleware for API routes
 * 
 * Usage:
 * export async function POST(req: NextRequest) {
 *   // Apply rate limiter with custom config
 *   const rateLimitResponse = applyRateLimit(req, {
 *     limit: 5,
 *     windowSizeInSeconds: 60,
 *   });
 *   
 *   if (rateLimitResponse) {
 *     return rateLimitResponse;
 *   }
 *   
 *   // Continue with your API logic...
 * }
 */
export function applyRateLimit(req: NextRequest, config: RateLimitConfig): NextResponse | null {
  if (isRateLimited(req, config)) {
    // Add rate limit headers to response
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', config.limit.toString());
    headers.set('X-RateLimit-Remaining', '0');
    headers.set('Retry-After', config.windowSizeInSeconds.toString());
    
    // Create rate limit error response
    const response = handleRateLimitError(req.nextUrl.pathname);
    
    // Add headers to response
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  return null;
}

/**
 * Auth-specific rate limiter configurations
 */
export const authRateLimitConfig: RateLimitConfig = {
  limit: 5, // 5 attempts
  windowSizeInSeconds: 60, // per minute
};

export const passwordResetRateLimitConfig: RateLimitConfig = {
  limit: 3, // 3 attempts
  windowSizeInSeconds: 300, // per 5 minutes
};

export const signupRateLimitConfig: RateLimitConfig = {
  limit: 3, // 3 attempts
  windowSizeInSeconds: 3600, // per hour
  keyGenerator: (req: NextRequest) => {
    // Rate limit by IP and email if available
    const ip = getIpAddress(req);
    try {
      // Try to parse JSON body if available
      let email = '';
      if (req.body) {
        // Safely handle body parsing
        const contentType = req.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const bodyText = req.body.toString();
          const bodyJson = JSON.parse(bodyText);
          email = bodyJson.email || '';
        }
      }
      return `${ip}:${email}`;
    } catch (e) {
      return ip;
    }
  }
}; 