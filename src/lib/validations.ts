import { z } from 'zod';

// Student validation schema
export const studentSchema = z.object({
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(100, 'الاسم طويل جداً')
    .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'الاسم يجب أن يحتوي على أحرف فقط'),
  phone: z
    .string()
    .min(10, 'رقم الهاتف قصير جداً')
    .max(15, 'رقم الهاتف طويل جداً')
    .regex(/^\+?[1-9]\d{1,14}$/, 'رقم الهاتف غير صحيح'),
  academic_year: z.enum([
    'الفرقة الأولي',
    'الفرقة الثانية',
    'الفرقة الثالثة',
    'الفرقة الرابعة',
  ]),
});

// Exam validation schema
export const examSchema = z.object({
  title: z
    .string()
    .min(1, 'اسم الامتحان مطلوب')
    .max(100, 'اسم الامتحان طويل جداً')
    .regex(
      /^[a-zA-Z\u0600-\u06FF0-9\s]+$/,
      'اسم الامتحان يحتوي على أحرف غير مسموحة'
    ),
  total_score: z
    .number()
    .min(1, 'الدرجة الكاملة يجب أن تكون أكبر من 0')
    .max(1000, 'الدرجة الكاملة كبيرة جداً')
    .int('الدرجة الكاملة يجب أن تكون رقماً صحيحاً'),
});

// Student exam validation schema
export const studentExamSchema = z.object({
  student_id: z.string().uuid('معرف الطالب غير صحيح'),
  exam_id: z.string().uuid('معرف الامتحان غير صحيح'),
  score: z
    .number()
    .min(0, 'الدرجة لا يمكن أن تكون سالبة')
    .max(1000, 'الدرجة كبيرة جداً')
    .nullable()
    .optional(),
});

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('البريد الإلكتروني غير صحيح')
    .min(1, 'البريد الإلكتروني مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// Signup validation schema
export const signupSchema = z
  .object({
    email: z
      .string()
      .email('البريد الإلكتروني غير صحيح')
      .min(1, 'البريد الإلكتروني مطلوب'),
    password: z
      .string()
      .min(12, 'كلمة المرور يجب أن تكون على الأقل 12 حرف')
      .max(128, 'كلمة المرور طويلة جداً')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'كلمة المرور يجب أن تحتوي على حرف صغير، حرف كبير، رقم، ورمز خاص'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

// Password reset validation schema
export const passwordResetSchema = z.object({
  email: z
    .string()
    .email('البريد الإلكتروني غير صحيح')
    .min(1, 'البريد الإلكتروني مطلوب'),
});

// New password validation schema
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(12, 'كلمة المرور يجب أن تكون على الأقل 12 حرف')
      .max(128, 'كلمة المرور طويلة جداً')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'كلمة المرور يجب أن تحتوي على حرف صغير، حرف كبير، رقم، ورمز خاص'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

// Type exports
export type StudentFormData = z.infer<typeof studentSchema>;
export type ExamFormData = z.infer<typeof examSchema>;
export type StudentExamFormData = z.infer<typeof studentExamSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
