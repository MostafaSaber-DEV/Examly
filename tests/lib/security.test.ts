import {
  sanitizeInput,
  sanitizeHtml,
  sanitizePhone,
  sanitizeEmail,
} from '@/lib/security';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="malicious.com"></iframe>Content';
      const result = sanitizeInput(input);
      expect(result).toBe('Content');
    });

    it('should remove dangerous attributes', () => {
      const input = '<div onclick="alert(1)">Safe content</div>';
      const result = sanitizeInput(input);
      expect(result).toBe('<div>Safe content</div>');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeInput(null as unknown as string)).toBe('');
      expect(sanitizeInput(undefined as unknown as string)).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove all HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeHtml(html);
      expect(result).toBe('Hello World');
    });

    it('should decode HTML entities', () => {
      const html = '&lt;script&gt;alert("xss")&lt;/script&gt;';
      const result = sanitizeHtml(html);
      expect(result).toBe('<script>alert("xss")</script>');
    });
  });

  describe('sanitizePhone', () => {
    it('should keep valid phone characters', () => {
      const phone = '+1 (555) 123-4567';
      const result = sanitizePhone(phone);
      expect(result).toBe('+1 (555) 123-4567');
    });

    it('should remove invalid characters', () => {
      const phone = '+1-555-123-4567<script>';
      const result = sanitizePhone(phone);
      expect(result).toBe('+1-555-123-4567');
    });
  });

  describe('sanitizeEmail', () => {
    it('should normalize email', () => {
      const email = 'USER@EXAMPLE.COM';
      const result = sanitizeEmail(email);
      expect(result).toBe('user@example.com');
    });

    it('should remove invalid characters', () => {
      const email = 'user+tag@example.com<script>';
      const result = sanitizeEmail(email);
      expect(result).toBe('user+tag@example.com');
    });
  });
});
