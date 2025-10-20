import { GET } from '@/app/api/health/route';
import { NextRequest } from 'next/server';

// Mock the rate limiter
jest.mock('@/lib/rate-limit', () => ({
  apiRateLimit: jest.fn(() => null), // Always return null (no rate limit)
}));

// Mock NextRequest for testing
global.Request =
  global.Request ||
  class MockRequest {
    constructor(public url: string) {}
  };

// Mock NextRequest
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string) {}
    headers = new Map();
  },
  NextResponse: {
    json: jest.fn((data) => ({
      status: 200,
      json: () => Promise.resolve(data),
    })),
  },
}));

describe('/api/health', () => {
  it('should return health status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(typeof data.uptime).toBe('number');
  });

  it('should return valid timestamp', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    const timestamp = new Date(data.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });
});
