'use client';

import { useState } from 'react';
import { StudentExamWithDetails, Student, Exam } from '@/types/entities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface PerformanceFormProps {
  performance?: StudentExamWithDetails | null;
  students: Student[];
  exams: Exam[];
  onSubmit: (data: {
    student_id: string;
    exam_id: string;
    score: number;
  }) => Promise<boolean>;
  onCancel: () => void;
}

export function PerformanceForm({
  performance,
  students,
  exams,
  onSubmit,
  onCancel,
}: PerformanceFormProps) {
  const [formData, setFormData] = useState({
    student_id: performance?.student_id || '',
    exam_id: performance?.exam_id || '',
    score: performance?.score || 0,
  });
  const [loading, setLoading] = useState(false);

  const selectedExam = exams.find((e) => e.id === formData.exam_id);
  const maxScore = selectedExam?.total_score || 100;

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
            {performance ? 'Edit Exam Result' : 'Record Exam Result'}
          </h3>
          <Button variant='outline' size='sm' onClick={onCancel}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Student *
            </label>
            <select
              required
              disabled={!!performance}
              value={formData.student_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, student_id: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100'
            >
              <option value=''>Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Exam *
            </label>
            <select
              required
              disabled={!!performance}
              value={formData.exam_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, exam_id: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100'
            >
              <option value=''>Select exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} (Total: {exam.total_score})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Score * {selectedExam && `(Max: ${maxScore})`}
            </label>
            <input
              type='number'
              required
              min='0'
              max={maxScore}
              value={formData.score}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  score: parseInt(e.target.value),
                }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Enter score'
            />
            {selectedExam && formData.score > 0 && (
              <p className='text-sm text-gray-600 mt-1'>
                Percentage: {((formData.score / maxScore) * 100).toFixed(1)}%
              </p>
            )}
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saving...' : performance ? 'Update' : 'Record Result'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
