'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { StudentExamWithDetails, Student, Exam } from '@/types/entities';
import { PerformanceForm } from './performance-form';

interface StudentPerformanceProps {
  studentExams: StudentExamWithDetails[];
  students: Student[];
  exams: Exam[];
  loading: boolean;
  onAdd: (data: {
    student_id: string;
    exam_id: string;
    score: number;
  }) => Promise<boolean>;
  onUpdate: (id: string, updates: { score: number }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function StudentPerformance({
  studentExams,
  students,
  exams,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: StudentPerformanceProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPerformance, setEditingPerformance] =
    useState<StudentExamWithDetails | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getPerformanceColor = (percentage: number | undefined) => {
    if (!percentage) return 'text-gray-500';
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBg = (percentage: number | undefined) => {
    if (!percentage) return 'bg-gray-100';
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleSubmit = async (data: {
    student_id: string;
    exam_id: string;
    score: number;
  }) => {
    const success = editingPerformance
      ? await onUpdate(editingPerformance.id, { score: data.score })
      : await onAdd(data);

    if (success) {
      setShowForm(false);
      setEditingPerformance(null);
    }
    return success;
  };

  const handleDelete = async (id: string) => {
    const success = await onDelete(id);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <Card className='p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-4 bg-gray-200 rounded w-1/4'></div>
          <div className='space-y-2'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-12 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <Card className='p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>Student Performance</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Record Result
          </Button>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-3 px-4 font-semibold'>Student</th>
                <th className='text-left py-3 px-4 font-semibold'>Exam</th>
                <th className='text-left py-3 px-4 font-semibold'>Score</th>
                <th className='text-left py-3 px-4 font-semibold'>
                  Percentage
                </th>
                <th className='text-left py-3 px-4 font-semibold'>Date</th>
                <th className='text-right py-3 px-4 font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentExams.map((performance) => (
                <tr key={performance.id} className='border-b hover:bg-gray-50'>
                  <td className='py-3 px-4 font-medium'>
                    {performance.student.name}
                  </td>
                  <td className='py-3 px-4'>{performance.exam.title}</td>
                  <td className='py-3 px-4'>
                    {performance.score !== null
                      ? `${performance.score}/${performance.exam.total_score}`
                      : 'Not taken'}
                  </td>
                  <td className='py-3 px-4'>
                    {performance.percentage !== undefined && (
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${getPerformanceBg(performance.percentage)} ${getPerformanceColor(performance.percentage)}`}
                      >
                        {performance.percentage.toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className='py-3 px-4'>
                    {new Date(performance.taken_at).toLocaleDateString()}
                  </td>
                  <td className='py-3 px-4 text-right'>
                    <div className='flex justify-end space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setEditingPerformance(performance);
                          setShowForm(true);
                        }}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setDeleteConfirm(performance.id)}
                        className='text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {studentExams.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              No exam results recorded yet.
            </div>
          )}
        </div>
      </Card>

      {showForm && (
        <PerformanceForm
          performance={editingPerformance}
          students={students}
          exams={exams}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPerformance(null);
          }}
        />
      )}

      {deleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Confirm Delete</h3>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this exam result? This action
              cannot be undone.
            </p>
            <div className='flex justify-end space-x-3'>
              <Button variant='outline' onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
