'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useExams } from '@/hooks/use-exams';
import { useStudents } from '@/hooks/use-students';
import { useStudentExams } from '@/hooks/use-student-exams';
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
  FileText,
  Search,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Trophy,
  ArrowRight,
  Users,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Exam } from '@/types/entities';

interface ExamsClientProps {
  user: SupabaseUser;
}

export default function ExamsClient({}: ExamsClientProps) {
  const { exams, loading, addExam, updateExam, deleteExam } = useExams();
  const { students } = useStudents();
  const { addStudentExam } = useStudentExams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [grades, setGrades] = useState<{ [key: string]: number }>({});
  const [formData, setFormData] = useState({
    title: '',
    total_score: 100,
  });

  // Enable real-time notifications
  useRealtimeNotifications();

  const handleSubmit = async () => {
    const success = editingExam
      ? await updateExam(editingExam.id, formData)
      : await addExam(formData);

    if (success) {
      setIsDialogOpen(false);
      setEditingExam(null);
      setFormData({ title: '', total_score: 100 });
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      total_score: exam.total_score,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteExam(id);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  const handleGrading = (exam: Exam) => {
    setSelectedExam(exam);
    setIsGradingOpen(true);
    setGrades({});
    setStudentSearch('');
  };

  const handleGradeSubmit = async (studentId: string) => {
    if (!selectedExam || !grades[studentId]) return;

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    // حفظ الدرجة في قاعدة البيانات
    const success = await addStudentExam({
      student_id: studentId,
      exam_id: selectedExam.id,
      score: grades[studentId],
    });

    if (success) {
      // إرسال البيانات للويب هوك
      if (process.env.NEXT_PUBLIC_WEBHOOK_URL) {
        try {
          await fetch(process.env.NEXT_PUBLIC_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              student_name: student.name,
              student_phone: student.phone,
              student_academic_year: student.academic_year,
              exam_name: selectedExam.title,
              total_score: selectedExam.total_score,
              student_score: grades[studentId],
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error('خطأ في إرسال البيانات للويب هوك:', error);
        }
      }

      setGrades((prev) => ({ ...prev, [studentId]: 0 }));
    }
  };

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase())
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
                <FileText className='h-6 w-6 mr-2' />
                إدارة الامتحانات
              </h1>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='bg-blue-600 hover:bg-blue-700'>
                  <Plus className='h-4 w-4 mr-2' />
                  إضافة امتحان
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[500px] bg-white border-0 shadow-2xl'>
                <DialogHeader className='pb-6 border-b border-gray-100'>
                  <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center'>
                    <FileText className='h-6 w-6 mr-3 text-blue-600' />
                    {editingExam ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}
                  </DialogTitle>
                </DialogHeader>
                <div className='grid gap-6 py-6'>
                  <div className='grid gap-3'>
                    <Label
                      htmlFor='title'
                      className='text-sm font-semibold text-gray-700'
                    >
                      اسم الامتحان
                    </Label>
                    <Input
                      id='title'
                      placeholder='أدخل اسم الامتحان'
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className='h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    />
                  </div>
                  <div className='grid gap-3'>
                    <Label
                      htmlFor='total_score'
                      className='text-sm font-semibold text-gray-700'
                    >
                      الدرجة الكاملة
                    </Label>
                    <Input
                      id='total_score'
                      type='number'
                      placeholder='100'
                      value={formData.total_score}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          total_score: parseInt(e.target.value) || 0,
                        }))
                      }
                      className='h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    />
                  </div>
                </div>
                <div className='flex justify-end gap-3 pt-6 border-t border-gray-100'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingExam(null);
                      setFormData({ title: '', total_score: 100 });
                    }}
                    className='px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.title || formData.total_score <= 0}
                    className='px-6 py-2 h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {editingExam ? 'تحديث' : 'إضافة امتحان'}
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
                placeholder='البحث في الامتحانات...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            <div className='flex items-center space-x-4 text-sm text-gray-600'>
              <span>المجموع: {exams.length} امتحان</span>
              <span>•</span>
              <span>المعروض: {filteredExams.length}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='p-2 rounded-lg bg-blue-500'>
                  <FileText className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    إجمالي الامتحانات
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {exams.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='p-2 rounded-lg bg-green-500'>
                  <Trophy className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    متوسط الدرجات
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {exams.length > 0
                      ? Math.round(
                          exams.reduce(
                            (sum, exam) => sum + exam.total_score,
                            0
                          ) / exams.length
                        )
                      : 0}
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
                      exams.filter((e) => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(e.created_at) > weekAgo;
                      }).length
                    }
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Exams Cards */}
        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-gray-600'>جاري تحميل الامتحانات...</p>
            </div>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className='text-center py-12'>
            <FileText className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              لا يوجد امتحانات
            </h3>
            <p className='text-gray-600'>
              قم بإضافة امتحانات جديدة أو تعديل البحث
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className='p-4 hover:shadow-lg transition-shadow duration-200'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center'>
                      <div className='h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center'>
                        <FileText className='h-6 w-6 text-white' />
                      </div>
                      <div className='ml-3'>
                        <h3 className='text-lg font-bold text-gray-900'>
                          {exam.title}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {new Date(exam.created_at).toLocaleDateString(
                            'ar-EG'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className='flex space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(exam)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setDeleteConfirm(exam.id)}
                        className='text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <Trophy className='h-4 w-4 text-gray-400 mr-2' />
                        <span className='text-sm text-gray-600'>
                          الدرجة الكاملة:
                        </span>
                      </div>
                      <span className='text-lg font-bold text-blue-600'>
                        {exam.total_score}
                      </span>
                    </div>
                  </div>

                  <div className='mt-4 pt-3 border-t border-gray-200'>
                    <Button
                      className='w-full bg-blue-600 hover:bg-blue-700 text-white'
                      onClick={() => handleGrading(exam)}
                    >
                      تسجيل الدرجات
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Grading Modal */}
      <Dialog open={isGradingOpen} onOpenChange={setIsGradingOpen}>
        <DialogContent className='max-w-4xl w-[95vw] max-h-[90vh] bg-white'>
          <DialogHeader className='pb-4'>
            <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center'>
              <Trophy className='h-6 w-6 mr-3 text-blue-600' />
              {selectedExam?.title}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Search Bar */}
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                type='text'
                placeholder='ابحث عن طالب...'
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className='pl-10 h-12 text-lg'
              />
            </div>

            {/* Students List */}
            <div className='max-h-[60vh] overflow-y-auto space-y-3'>
              {filteredStudents.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <Users className='h-12 w-12 mx-auto mb-2 text-gray-400' />
                  لا يوجد طلاب
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100'
                  >
                    <div className='flex-1'>
                      <h4 className='font-semibold text-gray-900 text-lg'>
                        {student.name}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {student.academic_year}
                      </p>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <Input
                        type='number'
                        placeholder='الدرجة'
                        value={grades[student.id] || ''}
                        onChange={(e) =>
                          setGrades((prev) => ({
                            ...prev,
                            [student.id]: parseInt(e.target.value) || 0,
                          }))
                        }
                        className='w-24 h-12 text-center text-lg font-semibold'
                        min='0'
                        max={selectedExam?.total_score}
                      />
                      <span className='text-lg text-gray-600 font-medium'>
                        / {selectedExam?.total_score}
                      </span>

                      <Button
                        onClick={() => handleGradeSubmit(student.id)}
                        disabled={
                          !grades[student.id] ||
                          (grades[student.id] ?? 0) >
                            (selectedExam?.total_score || 0)
                        }
                        className='h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                      >
                        <ArrowRight className='h-5 w-5 text-white' />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>تأكيد الحذف</h3>
            <p className='text-gray-600 mb-6'>
              هل أنت متأكد من حذف هذا الامتحان؟ لا يمكن التراجع عن هذا الإجراء.
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
