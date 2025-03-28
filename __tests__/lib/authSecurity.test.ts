/**
 * Tests for authentication security utilities
 */
import {
  generateCSRFToken,
  validateCSRFToken,
  checkRateLimit,
  resetRateLimit,
  sanitizeAuthInput,
  validatePasswordStrength,
  generateSessionId
} from '@/lib/authSecurity';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Authentication Security Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('CSRF Token', () => {
    test('generateCSRFToken should create a token and store it in localStorage', () => {
      const token = generateCSRFToken();
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(16); // Should be a long string
      expect(localStorage.getItem('csrf_token')).toBe(token);
      expect(localStorage.getItem('csrf_token_time')).toBeTruthy();
    });

    test('validateCSRFToken should return valid=true for matching tokens', () => {
      const token = generateCSRFToken();
      const result = validateCSRFToken(token);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();

      // Token should be cleared after validation
      expect(localStorage.getItem('csrf_token')).toBeNull();
    });

    test('validateCSRFToken should return valid=false for non-matching tokens', () => {
      const token = generateCSRFToken();
      const result = validateCSRFToken('invalid-token');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Token mismatch');
    });

    test('validateCSRFToken should return valid=false when no token is stored', () => {
      localStorage.removeItem('csrf_token');
      const result = validateCSRFToken('some-token');
      expect(result.valid).toBe(false);
      expect(result.error?.message).toContain('No token found');
    });

    test('validateCSRFToken should return valid=false for expired tokens', () => {
      const token = generateCSRFToken();
      // Set token time to 2 hours ago (beyond 1 hour expiration)
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
      localStorage.setItem('csrf_token_time', twoHoursAgo.toString());
      
      const result = validateCSRFToken(token);
      expect(result.valid).toBe(false);
      expect(result.error?.message).toContain('Token expired');
    });
  });

  describe('Rate Limiting', () => {
    test('checkRateLimit should allow initial attempts', () => {
      const result = checkRateLimit('test@example.com');
      expect(result.valid).toBe(true);
    });

    test('checkRateLimit should block after max attempts', () => {
      const email = 'max-attempts@example.com';
      
      // Make allowed attempts
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(email);
        expect(result.valid).toBe(true);
      }
      
      // Next attempt should be blocked
      const blockedResult = checkRateLimit(email);
      expect(blockedResult.valid).toBe(false);
      expect(blockedResult.error?.message).toContain('Too many login attempts');
    });

    test('resetRateLimit should reset the attempts counter', () => {
      const email = 'reset-test@example.com';
      
      // Make several attempts
      for (let i = 0; i < 4; i++) {
        checkRateLimit(email);
      }
      
      // Reset the counter
      resetRateLimit(email);
      
      // Should be able to attempt again
      const result = checkRateLimit(email);
      expect(result.valid).toBe(true);
    });
  });

  describe('Input Sanitization', () => {
    test('sanitizeAuthInput should trim whitespace', () => {
      expect(sanitizeAuthInput('  test@example.com  ')).toBe('test@example.com');
    });

    test('sanitizeAuthInput should remove potentially harmful characters', () => {
      expect(sanitizeAuthInput('test<script>alert("xss")</script>')).toBe('testscriptalert("xss")/script');
    });

    test('sanitizeAuthInput should limit length', () => {
      const longString = 'a'.repeat(300);
      expect(sanitizeAuthInput(longString).length).toBe(255);
    });

    test('sanitizeAuthInput should handle empty inputs', () => {
      expect(sanitizeAuthInput('')).toBe('');
      expect(sanitizeAuthInput(null as unknown as string)).toBe('');
      expect(sanitizeAuthInput(undefined as unknown as string)).toBe('');
    });
  });

  describe('Password Validation', () => {
    test('validatePasswordStrength should return empty array for strong passwords', () => {
      const strongPassword = 'StrongP@ss123';
      expect(validatePasswordStrength(strongPassword)).toEqual([]);
    });

    test('validatePasswordStrength should validate length requirement', () => {
      const shortPassword = 'Short1!';
      const errors = validatePasswordStrength(shortPassword);
      expect(errors).toContain('Password must be at least 8 characters long');
    });

    test('validatePasswordStrength should validate uppercase requirement', () => {
      const noUppercase = 'nouppercase123!';
      const errors = validatePasswordStrength(noUppercase);
      expect(errors).toContain('Password must contain at least one uppercase letter');
    });

    test('validatePasswordStrength should validate lowercase requirement', () => {
      const noLowercase = 'NOLOWERCASE123!';
      const errors = validatePasswordStrength(noLowercase);
      expect(errors).toContain('Password must contain at least one lowercase letter');
    });

    test('validatePasswordStrength should validate number requirement', () => {
      const noNumbers = 'NoNumbers!';
      const errors = validatePasswordStrength(noNumbers);
      expect(errors).toContain('Password must contain at least one number');
    });

    test('validatePasswordStrength should validate special character requirement', () => {
      const noSpecialChars = 'NoSpecialChars123';
      const errors = validatePasswordStrength(noSpecialChars);
      expect(errors).toContain('Password must contain at least one special character');
    });

    test('validatePasswordStrength should handle empty input', () => {
      const errors = validatePasswordStrength('');
      expect(errors).toContain('Password is required');
      expect(errors.length).toBe(1); // Should only return this one error
    });
  });

  describe('Session Management', () => {
    test('generateSessionId should create a unique session ID', () => {
      const sessionId1 = generateSessionId();
      const sessionId2 = generateSessionId();
      
      expect(sessionId1).toContain('session_');
      expect(sessionId2).toContain('session_');
      expect(sessionId1).not.toBe(sessionId2); // Should be unique
    });
  });
}); 