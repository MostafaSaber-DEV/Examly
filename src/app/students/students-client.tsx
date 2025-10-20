// src/app/students/students-client.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useStudents } from '@/hooks/use-students';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  Plus,
  ArrowLeft,
  Phone,
  GraduationCap,
  Edit,
  Trash2,
  UserCheck,
  Calendar,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Student } from '@/types/entities';

interface StudentsClientProps {
  user: SupabaseUser;
}

export default function StudentsClient({}: StudentsClientProps) {
  const { students, loading, addStudent, updateStudent, deleteStudent } =
    useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    academic_year: '',
  });

  // Enable real-time notifications
  useRealtimeNotifications();

  const handleSubmit = async () => {
    const success = editingStudent
      ? await updateStudent(editingStudent.id, formData)
      : await addStudent(formData);

    if (success) {
      setIsDialogOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', phone: '', academic_year: '' });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      phone: student.phone,
      academic_year: student.academic_year,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteStudent(id);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      student.academic_year.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <Toaster position='top-right' />

      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/dashboard'
                className='inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Dashboard
              </Link>
              <div className='h-6 w-px bg-gray-300' />
              <h1 className='text-2xl font-bold text-gray-900 flex items-center'>
                <Users className='h-6 w-6 mr-2' />
                إدارة الطلاب
              </h1>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='bg-blue-600 hover:bg-blue-700'>
                  <Plus className='h-4 w-4 mr-2' />
                  إضافة طالب
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[500px] bg-white border-0 shadow-2xl'>
                <DialogHeader className='pb-6 border-b border-gray-100'>
                  <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center'>
                    <Users className='h-6 w-6 mr-3 text-blue-600' />
                    {editingStudent ? 'تعديل الطالب' : 'إضافة طالب جديد'}
                  </DialogTitle>
                </DialogHeader>
                <div className='grid gap-6 py-6'>
                  <div className='grid gap-3'>
                    <Label
                      htmlFor='name'
                      className='text-sm font-semibold text-gray-700'
                    >
                      اسم الطالب
                    </Label>
                    <Input
                      id='name'
                      placeholder='أدخل الاسم الكامل'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className='h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    />
                  </div>
                  <div className='grid gap-3'>
                    <Label
                      htmlFor='phone'
                      className='text-sm font-semibold text-gray-700'
                    >
                      رقم الهاتف
                    </Label>
                    <Input
                      id='phone'
                      placeholder='أدخل رقم الهاتف'
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className='h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    />
                  </div>
                  <div className='grid gap-3'>
                    <Label
                      htmlFor='academic_year'
                      className='text-sm font-semibold text-gray-700'
                    >
                      السنة الدراسية
                    </Label>
                    <Select
                      value={formData.academic_year}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          academic_year: value,
                        }))
                      }
                    >
                      <SelectTrigger className='h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500'>
                        <SelectValue placeholder='اختر السنة الدراسية' />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-gray-200 shadow-lg'>
                        <SelectItem
                          value='الفرقة الأولي'
                          className='hover:bg-blue-50'
                        >
                          الفرقة الأولي
                        </SelectItem>
                        <SelectItem
                          value='الفرقة الثانية'
                          className='hover:bg-blue-50'
                        >
                          الفرقة الثانية
                        </SelectItem>
                        <SelectItem
                          value='الفرقة الثالثة'
                          className='hover:bg-blue-50'
                        >
                          الفرقة الثالثة
                        </SelectItem>
                        <SelectItem
                          value='الفرقة الرابعة'
                          className='hover:bg-blue-50'
                        >
                          الفرقة الرابعة
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='flex justify-end gap-3 pt-6 border-t border-gray-100'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingStudent(null);
                      setFormData({ name: '', phone: '', academic_year: '' });
                    }}
                    className='px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !formData.name ||
                      !formData.phone ||
                      !formData.academic_year
                    }
                    className='px-6 py-2 h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {editingStudent ? 'تحديث' : 'إضافة طالب'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Search and Stats */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6'>
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                type='text'
                placeholder='البحث في الطلاب...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            <div className='flex items-center space-x-4 text-sm text-gray-600'>
              <span>المجموع: {students.length} طالب</span>
              <span>•</span>
              <span>المعروض: {filteredStudents.length}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='p-2 rounded-lg bg-blue-500'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    إجمالي الطلاب
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {students.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='p-2 rounded-lg bg-green-500'>
                  <UserCheck className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    السنة الحالية
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {
                      students.filter((s) => s.academic_year === '2024-2025')
                        .length
                    }
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='p-2 rounded-lg bg-purple-500'>
                  <Calendar className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    جديد هذا الأسبوع
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {
                      students.filter((s) => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(s.created_at) > weekAgo;
                      }).length
                    }
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Students Cards */}
        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-gray-600'>جاري تحميل الطلاب...</p>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className='text-center py-12'>
            <Users className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              لا يوجد طلاب
            </h3>
            <p className='text-gray-600'>قم بإضافة طلاب جدد أو تعديل البحث</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className='p-4 hover:shadow-lg transition-shadow duration-200'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center'>
                      <div className='h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center'>
                        <span className='text-white font-bold text-lg'>
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className='ml-3'>
                        <h3 className='text-lg font-bold text-gray-900'>
                          {student.name}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {new Date(student.created_at).toLocaleDateString(
                            'ar-EG'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className='flex space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(student)}
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
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center'>
                      <Phone className='h-4 w-4 text-gray-400 mr-2' />
                      <span className='text-sm text-gray-900'>
                        {student.phone}
                      </span>
                    </div>

                    <div className='flex items-center'>
                      <GraduationCap className='h-4 w-4 text-gray-400 mr-2' />
                      <span className='text-sm text-gray-900'>
                        {student.academic_year}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>تأكيد الحذف</h3>
            <p className='text-gray-600 mb-6'>
              هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className='flex justify-end space-x-3'>
              <Button variant='outline' onClick={() => setDeleteConfirm(null)}>
                إلغاء
              </Button>
              <Button
                variant='destructive'
                onClick={() => handleDelete(deleteConfirm)}
              >
                حذف
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
