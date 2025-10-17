import {
  validatePassword,
  getPasswordStrengthLabel,
} from '@/lib/auth/password-validation';

describe('Password Validation', () => {
  describe('validatePassword', () => {
    it('should reject passwords shorter than 12 characters', () => {
      const result = validatePassword('Short123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must be at least 12 characters long'
      );
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('PasswordTest!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one number'
      );
    });

    it('should reject passwords without special characters', () => {
      const result = validatePassword('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one special character'
      );
    });

    it('should reject passwords with common patterns', () => {
      const result = validatePassword('Password123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password contains common patterns that are easily guessed'
      );
    });

    it('should accept strong passwords', () => {
      const result = validatePassword('MyStr0ng!P@ssw0rd2024');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(60);
    });

    it('should reject passwords with repeated characters', () => {
      const result = validatePassword('Passwordaaa123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password contains common patterns that are easily guessed'
      );
    });

    it('should calculate entropy correctly', () => {
      const weakPassword = validatePassword('Password123!');
      const strongPassword = validatePassword('Tr0ub4dor&3$MyC0mpl3xP@ssw0rd!');

      expect(strongPassword.score).toBeGreaterThan(weakPassword.score);
    });
  });

  describe('getPasswordStrengthLabel', () => {
    it('should return correct strength labels', () => {
      expect(getPasswordStrengthLabel(90)).toBe('Very Strong');
      expect(getPasswordStrengthLabel(70)).toBe('Strong');
      expect(getPasswordStrengthLabel(50)).toBe('Moderate');
      expect(getPasswordStrengthLabel(30)).toBe('Weak');
      expect(getPasswordStrengthLabel(10)).toBe('Very Weak');
    });
  });
});

describe('Password Security Edge Cases', () => {
  it('should handle very long passwords', () => {
    const longPassword = 'A'.repeat(200) + '1!';
    const result = validatePassword(longPassword);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must not exceed 128 characters');
  });

  it('should handle empty passwords', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should handle unicode characters', () => {
    const result = validatePassword('MyStr0ng!P@ssw0rd🔒');
    expect(result.isValid).toBe(true);
  });

  it('should detect keyboard patterns', () => {
    const result = validatePassword('Qwerty123456!');
    expect(result.isValid).toBe(false);
  });
});
