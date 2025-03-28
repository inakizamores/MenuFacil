/**
 * Rate Limiting Middleware for API Routes
 * 
 * This middleware provides rate limiting for API routes, with special handling
 * for authentication endpoints. It uses the enhanced rate limiting system from
 * lib/rateLimit.ts.
 */

import { NextResponse, NextRequest } from 'next/server';
import { 
  rateLimit, 
  AUTH_RATE_LIMITER, 
  API_RATE_LIMITER, 
  PUBLIC_RATE_LIMITER,
  resetRateLimitCounter
} from '@/lib/rateLimit';

// Type definitions
export interface RateLimitMiddlewareOptions {
  // Override the default rate limiter (defaults to API_RATE_LIMITER)
  limiter?: typeof AUTH_RATE_LIMITER | typeof API_RATE_LIMITER | typeof PUBLIC_RATE_LIMITER;
  
  // Skip rate limiting for certain conditions (e.g., admin users)
  skip?: (req: NextRequest) => Promise<boolean> | boolean;
  
  // Custom key generation function (default is IP-based)
  getKey?: (req: NextRequest) => Promise<string> | string;
  
  // For withRateLimitHandler wrapper
  windowMs?: number;
  max?: number;
  message?: string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  identifierFn?: (req: NextRequest) => string | undefined;
}

/**
 * Rate limiting middleware for Next.js API routes
 * 
 * @param req - Next.js request object
 * @param options - Optional middleware configuration
 * @returns Response object if rate limited, or null to continue
 */
export async function withRateLimit(
  req: NextRequest, 
  options: RateLimitMiddlewareOptions = {}
): Promise<NextResponse | null> {
  try {
    // Check if we should skip rate limiting
    if (options.skip && await options.skip(req)) {
      return null;
    }
    
    // Determine which rate limiter to use
    const rateLimiter = options.limiter || API_RATE_LIMITER;
    
    // Default key is the IP address
    let key = getClientIp(req);
    
    // Allow custom key generation
    if (options.getKey) {
      key = await options.getKey(req);
    }
    // If custom identifier function is provided
    else if (options.identifierFn) {
      const customKey = options.identifierFn(req);
      if (customKey) {
        key = `${customKey}:${key}`;
      }
    }
    // For auth endpoints, use the user identifier if available
    else if (rateLimiter.name === 'auth') {
      try {
        const body = await req.clone().json();
        if (body?.email) {
          // Combine email with IP to prevent email enumeration but still allow IP-based limiting
          key = `${body.email.toLowerCase()}:${key}`;
        }
      } catch (e) {
        // Failed to parse JSON body, just use the IP
      }
    }
    
    // Apply rate limiting
    const result = await rateLimit(key, rateLimiter);
    
    // If rate limited, return 429 response
    if (!result.success) {
      const response = NextResponse.json(
        {
          error: 'Too Many Requests',
          message: options.message || result.error?.message || 'Rate limit exceeded',
          details: result.error?.details
        },
        { status: 429 }
      );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.reset.toString());
      response.headers.set('Retry-After', Math.ceil((result.reset - Date.now()) / 1000).toString());
      
      return response;
    }
    
    // Not rate limited, continue to the API route
    return null;
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // Allow the request to proceed on error to avoid blocking legitimate requests
    return null;
  }
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * 
 * @param options - Rate limiting configuration options
 * @param handler - API route handler function
 * @returns Wrapped handler function with rate limiting
 */
export function withRateLimitHandler(
  options: RateLimitMiddlewareOptions,
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    // Apply rate limiting first
    const rateLimitResult = await withRateLimit(req, options);
    
    // If rate limited, return the 429 response
    if (rateLimitResult) {
      return rateLimitResult;
    }
    
    // Not rate limited, continue to the handler
    return handler(req);
  };
}

/**
 * Record a successful authentication to reset rate limiting for a user
 * 
 * @param identifier - User identifier (email or username)
 * @param ip - Client IP address
 */
export async function resetAuthRateLimit(identifier: string, ip: string): Promise<void> {
  // Reset by combined email+IP key
  await resetRateLimitCounter(`${identifier.toLowerCase()}:${ip}`, 'auth');
  
  // Also reset by IP alone
  await resetRateLimitCounter(ip, 'auth');
}

/**
 * Extract the client IP address from a request
 * 
 * @param req - Next.js request object
 * @returns Client IP address
 */
function getClientIp(req: NextRequest): string {
  // Check for Cloudflare or Vercel headers first
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  
  // Then check for standard forwarded headers
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // Get the first IP in the list
    return forwarded.split(',')[0].trim();
  }
  
  // Fall back to remote address (may be a proxy)
  return req.ip || '0.0.0.0';
} 