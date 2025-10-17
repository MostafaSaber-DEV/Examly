import { headers } from 'next/headers';
import { z } from 'zod';

export const sanitizeInput = (input: string): string => {
  return input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
};

export const validateCSRF = async () => {
  const headersList = await headers();
  const origin = headersList.get('origin');
  const host = headersList.get('host');

  if (!origin || !host) {
    throw new Error('Missing required headers');
  }

  const originUrl = new URL(origin);
  if (originUrl.host !== host) {
    throw new Error('CSRF validation failed');
  }
};

export const rateLimitSchema = z.object({
  ip: z.string(),
  endpoint: z.string(),
  timestamp: z.number(),
});
