'use client';

import { useState } from 'react';
import { Student } from '@/types/entities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { StudentForm } from './student-form';

interface StudentsTableProps {
  students: Student[];
  loading: boolean;
  onAdd: (student: Omit<Student, 'id' | 'created_at'>) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<Student>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function StudentsTable({
  students,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      student.academic_year.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (data: Omit<Student, 'id' | 'created_at'>) => {
    const success = editingStudent
      ? await onUpdate(editingStudent.id, data)
      : await onAdd(data);

    if (success) {
      setShowForm(false);
      setEditingStudent(null);
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
          <h2 className='text-2xl font-bold'>Students Management</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Add Student
          </Button>
        </div>

        <div className='flex items-center space-x-4 mb-6'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <input
              type='text'
              placeholder='Search students...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-3 px-4 font-semibold'>Name</th>
                <th className='text-left py-3 px-4 font-semibold'>Phone</th>
                <th className='text-left py-3 px-4 font-semibold'>
                  Academic Year
                </th>
                <th className='text-left py-3 px-4 font-semibold'>Created</th>
                <th className='text-right py-3 px-4 font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className='border-b hover:bg-gray-50'>
                  <td className='py-3 px-4 font-medium'>{student.name}</td>
                  <td className='py-3 px-4'>{student.phone}</td>
                  <td className='py-3 px-4'>{student.academic_year}</td>
                  <td className='py-3 px-4'>
                    {new Date(student.created_at).toLocaleDateString()}
                  </td>
                  <td className='py-3 px-4 text-right'>
                    <div className='flex justify-end space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setEditingStudent(student);
                          setShowForm(true);
                        }}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setDeleteConfirm(student.id)}
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

          {filteredStudents.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              {searchTerm
                ? 'No students found matching your search.'
                : 'No students added yet.'}
            </div>
          )}
        </div>
      </Card>

      {showForm && (
        <StudentForm
          student={editingStudent}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
        />
      )}

      {deleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Confirm Delete</h3>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this student? This action cannot
              be undone.
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
