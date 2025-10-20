import { headers } from 'next/headers';
import { z } from 'zod';

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';

  return (
    input
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove other dangerous tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      // Remove dangerous attributes
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s*javascript\s*:/gi, '')
      // Remove null bytes
      .replace(/\0/g, '')
      // Trim whitespace
      .trim()
  );
};

// Sanitize HTML content more thoroughly
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';

  return (
    html
      // Remove all HTML tags
      .replace(/<[^>]*>/g, '')
      // Decode HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      // Remove any remaining dangerous content
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .trim()
  );
};

// Sanitize phone number
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';

  return phone
    .replace(/[^\d+\-\s()]/g, '') // Keep only digits, +, -, spaces, and parentheses
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

// Sanitize email
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';

  return email
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // Remove any HTML tags first
    .replace(/[^\w@.+-]/g, '') // Keep only alphanumeric, @, ., +, and -
    .trim();
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
