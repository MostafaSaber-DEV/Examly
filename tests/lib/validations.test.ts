import {
  studentSchema,
  examSchema,
  loginSchema,
  signupSchema,
} from '@/lib/validations';

describe('Validation Schemas', () => {
  describe('studentSchema', () => {
    it('should validate correct student data', () => {
      const validStudent = {
        name: 'John Doe',
        phone: '+1234567890',
        academic_year: 'الفرقة الأولي',
      };

      const result = studentSchema.safeParse(validStudent);
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const invalidStudent = {
        name: 'John Doe',
        phone: 'invalid-phone',
        academic_year: 'الفرقة الأولي',
      };

      const result = studentSchema.safeParse(invalidStudent);
      expect(result.success).toBe(false);
    });

    it('should reject invalid academic year', () => {
      const invalidStudent = {
        name: 'John Doe',
        phone: '+1234567890',
        academic_year: 'Invalid Year',
      };

      const result = studentSchema.safeParse(invalidStudent);
      expect(result.success).toBe(false);
    });
  });

  describe('examSchema', () => {
    it('should validate correct exam data', () => {
      const validExam = {
        title: 'Math Final Exam',
        total_score: 100,
      };

      const result = examSchema.safeParse(validExam);
      expect(result.success).toBe(true);
    });

    it('should reject negative score', () => {
      const invalidExam = {
        title: 'Math Final Exam',
        total_score: -10,
      };

      const result = examSchema.safeParse(invalidExam);
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const invalidExam = {
        title: '',
        total_score: 100,
      };

      const result = examSchema.safeParse(invalidExam);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('should validate correct signup data', () => {
      const validSignup = {
        email: 'user@example.com',
        password: 'StrongPassword123!',
        confirmPassword: 'StrongPassword123!',
      };

      const result = signupSchema.safeParse(validSignup);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidSignup = {
        email: 'user@example.com',
        password: 'StrongPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      const result = signupSchema.safeParse(invalidSignup);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidSignup = {
        email: 'user@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      };

      const result = signupSchema.safeParse(invalidSignup);
      expect(result.success).toBe(false);
    });
  });
});
