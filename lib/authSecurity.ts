/**
 * Authentication security utilities
 * Provides enhanced security features for authentication flows
 */

import { createDetailedError, DetailedError } from './errorHandling';
import { nanoid } from 'nanoid';

// Token validation functions
export interface TokenValidationResult {
  valid: boolean;
  error?: DetailedError;
}

/**
 * Generate a secure CSRF token for authentication forms
 */
export function generateCSRFToken(): string {
  // Generate a cryptographically secure random token
  const token = nanoid(32);
  
  // Store in localStorage for single-page apps
  if (typeof window !== 'undefined') {
    localStorage.setItem('csrf_token', token);
    localStorage.setItem('csrf_token_time', Date.now().toString());
  }
  
  return token;
}

/**
 * Validate a CSRF token from a form submission
 */
export function validateCSRFToken(token: string): TokenValidationResult {
  // Retrieve the stored token
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('csrf_token') : null;
  const tokenTime = typeof window !== 'undefined' ? localStorage.getItem('csrf_token_time') : null;
  
  // If no stored token exists
  if (!storedToken) {
    return {
      valid: false,
      error: createDetailedError(
        'CSRF token validation failed: No token found',
        'auth',
        { code: 'csrf_missing' }
      )
    };
  }
  
  // Check if token is expired (tokens valid for 1 hour)
  if (tokenTime && (Date.now() - parseInt(tokenTime, 10) > 3600000)) {
    return {
      valid: false,
      error: createDetailedError(
        'CSRF token validation failed: Token expired',
        'auth',
        { code: 'csrf_expired' }
      )
    };
  }
  
  // Compare the tokens
  if (token !== storedToken) {
    return {
      valid: false,
      error: createDetailedError(
        'CSRF token validation failed: Token mismatch',
        'auth',
        { code: 'csrf_invalid' }
      )
    };
  }
  
  // Successfully validated, clear the token to prevent reuse
  if (typeof window !== 'undefined') {
    localStorage.removeItem('csrf_token');
    localStorage.removeItem('csrf_token_time');
  }
  
  return { valid: true };
}

// Rate limiting for authentication attempts
const AUTH_ATTEMPTS = new Map<string, { count: number, resetTime: number }>();
const MAX_ATTEMPTS = 5; // Maximum attempts before rate limiting
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Check if an authentication attempt should be rate limited
 * @param identifier - Usually an email or IP address
 */
export function checkRateLimit(identifier: string): TokenValidationResult {
  const now = Date.now();
  const attemptData = AUTH_ATTEMPTS.get(identifier);
  
  // If no previous attempts or lockout has expired
  if (!attemptData || now > attemptData.resetTime) {
    // Reset the attempts counter
    AUTH_ATTEMPTS.set(identifier, { count: 1, resetTime: now + LOCKOUT_DURATION });
    return { valid: true };
  }
  
  // Check if max attempts exceeded
  if (attemptData.count >= MAX_ATTEMPTS) {
    // Calculate remaining lockout time
    const remainingTime = Math.ceil((attemptData.resetTime - now) / 60000); // minutes
    
    return {
      valid: false,
      error: createDetailedError(
        `Too many login attempts. Please try again in ${remainingTime} minutes.`,
        'auth',
        { 
          code: 'rate_limited',
          details: { 
            remainingTime,
            attemptsCount: attemptData.count,
            maxAttempts: MAX_ATTEMPTS 
          }
        }
      )
    };
  }
  
  // Increment attempt counter
  AUTH_ATTEMPTS.set(identifier, { 
    count: attemptData.count + 1, 
    resetTime: attemptData.resetTime 
  });
  
  return { valid: true };
}

/**
 * Record a successful authentication to reset rate limiting
 */
export function resetRateLimit(identifier: string): void {
  AUTH_ATTEMPTS.delete(identifier);
}

/**
 * Sanitize input data to prevent injection attacks in authentication flows
 */
export function sanitizeAuthInput(input: string): string {
  if (!input) return '';
  
  // Basic sanitization to prevent injection
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .substring(0, 255);    // Limit length
}

/**
 * Validate password requirements
 * @returns string[] Array of validation errors, empty if valid
 */
export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return errors;
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
}

/**
 * Check if a refresh token has suspicious characteristics
 * that might indicate token theft
 */
export function detectSuspiciousTokenActivity(
  userId: string, 
  userAgent: string, 
  ipAddress: string
): TokenValidationResult {
  // In a real implementation, this would check against a database of previous sessions
  // and look for sudden changes in location, device, etc.
  
  // For now, just return valid since we need database implementation
  return { valid: true };
}

/**
 * Generate secure session ID for authentication context
 */
export function generateSessionId(): string {
  return `session_${nanoid(16)}_${Date.now()}`;
} 