'use client';

import { useState } from 'react';
import { Exam } from '@/types/entities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { examSchema, type ExamFormData } from '@/lib/validations';
import { sanitizeInput } from '@/lib/security';

interface ExamFormProps {
  exam?: Exam | null;
  onSubmit: (data: Omit<Exam, 'id' | 'created_at'>) => Promise<boolean>;
  onCancel: () => void;
}

export function ExamFormValidated({ exam, onSubmit, onCancel }: ExamFormProps) {
  const [formData, setFormData] = useState<ExamFormData>({
    title: exam?.title || '',
    total_score: exam?.total_score || 100,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    try {
      examSchema.parse(formData);
      setErrors({});
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error.errors?.forEach((err: any) => {
        if (err.path) {
          newErrors[err.path[0]] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleInputChange = (
    field: keyof ExamFormData,
    value: string | number
  ) => {
    const sanitizedValue =
      typeof value === 'string' ? sanitizeInput(value) : value;

    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <Card className='p-6 max-w-md w-full mx-4'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-lg font-semibold'>
            {exam ? 'Edit Exam' : 'Add New Exam'}
          </h3>
          <Button variant='outline' size='sm' onClick={onCancel}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label
              htmlFor='title'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Exam Title *
            </Label>
            <Input
              id='title'
              type='text'
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter exam title'
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <div
                id='title-error'
                className='text-red-600 text-sm mt-1'
                role='alert'
              >
                {errors.title}
              </div>
            )}
          </div>

          <div>
            <Label
              htmlFor='total_score'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Total Score *
            </Label>
            <Input
              id='total_score'
              type='number'
              required
              min='1'
              max='1000'
              value={formData.total_score}
              onChange={(e) =>
                handleInputChange('total_score', parseInt(e.target.value) || 0)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.total_score ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter total score'
              aria-invalid={!!errors.total_score}
              aria-describedby={
                errors.total_score ? 'total_score-error' : undefined
              }
            />
            {errors.total_score && (
              <div
                id='total_score-error'
                className='text-red-600 text-sm mt-1'
                role='alert'
              >
                {errors.total_score}
              </div>
            )}
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading || !formData.title || formData.total_score <= 0}
              className='min-w-[100px]'
            >
              {loading ? 'Saving...' : exam ? 'Update' : 'Add Exam'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
