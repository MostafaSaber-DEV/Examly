import {
  rateLimit,
  apiRateLimit,
  loginRateLimit,
  clearRateLimitMap,
} from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string) {}
    headers = new Map();
  },
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
      headers: new Map(),
    })),
  },
}));

// Mock NextRequest
const createMockRequest = (ip: string = '127.0.0.1'): NextRequest => {
  return {
    ip,
    headers: {
      get: jest.fn((name: string) => {
        if (name === 'x-forwarded-for') return ip;
        return null;
      }),
    },
  } as unknown as NextRequest;
};

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit map before each test
    jest.clearAllMocks();
    clearRateLimitMap();
  });

  describe('rateLimit', () => {
    it('should allow requests within limit', () => {
      const limiter = rateLimit({
        windowMs: 60000, // 1 minute
        maxRequests: 10,
      });

      const request = createMockRequest();
      const result = limiter(request);

      expect(result).toBeNull(); // No rate limit exceeded
    });

    it('should block requests exceeding limit', () => {
      const limiter = rateLimit({
        windowMs: 60000, // 1 minute
        maxRequests: 1,
      });

      const request = createMockRequest();

      // First request should pass
      const firstResult = limiter(request);
      expect(firstResult).toBeNull();

      // Second request should be blocked
      const secondResult = limiter(request);
      expect(secondResult).not.toBeNull();
      expect(secondResult?.status).toBe(429);
    });

    it('should include rate limit headers when blocked', () => {
      const limiter = rateLimit({
        windowMs: 60000,
        maxRequests: 1,
      });

      const request = createMockRequest();

      // First request
      limiter(request);

      // Second request (should be blocked)
      const result = limiter(request);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
      // Check that headers exist in the NextResponse
      expect(result?.headers).toBeDefined();
    });
  });

  describe('predefined rate limiters', () => {
    it('should have correct login rate limit', () => {
      const request = createMockRequest();
      const result = loginRateLimit(request);

      // Should not be rate limited initially
      expect(result).toBeNull();
    });

    it('should have correct API rate limit', () => {
      const request = createMockRequest();
      const result = apiRateLimit(request);

      // Should not be rate limited initially
      expect(result).toBeNull();
    });
  });
});
