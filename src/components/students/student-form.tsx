'use client';

import { useState } from 'react';
import { Student } from '@/types/entities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (data: Omit<Student, 'id' | 'created_at'>) => Promise<boolean>;
  onCancel: () => void;
}

export function StudentForm({ student, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    phone: student?.phone || '',
    academic_year: student?.academic_year || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            {student ? 'Edit Student' : 'Add New Student'}
          </h3>
          <Button variant='outline' size='sm' onClick={onCancel}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Name *
            </label>
            <input
              type='text'
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Enter student name'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Phone Number *
            </label>
            <input
              type='tel'
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Enter phone number'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Academic Year *
            </label>
            <select
              required
              value={formData.academic_year}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  academic_year: e.target.value,
                }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value=''>Select academic year</option>
              <option value='2024-2025'>2024-2025</option>
              <option value='2023-2024'>2023-2024</option>
              <option value='2022-2023'>2022-2023</option>
              <option value='2021-2022'>2021-2022</option>
            </select>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saving...' : student ? 'Update' : 'Add Student'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
