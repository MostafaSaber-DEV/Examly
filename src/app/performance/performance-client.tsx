'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useStudents } from '@/hooks/use-students';
import { useExams } from '@/hooks/use-exams';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  Search,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Trophy,
  Users,
  FileText,
  Award,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { StudentExamWithDetails } from '@/types/entities';

interface PerformanceClientProps {
  user: SupabaseUser;
}

export default function PerformanceClient({}: PerformanceClientProps) {
  const { students } = useStudents();
  const { exams } = useExams();
  const {
    studentExams,
    loading,
    addStudentExam,
    updateStudentExam,
    deleteStudentExam,
  } = useStudentExams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerformance, setEditingPerformance] =
    useState<StudentExamWithDetails | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    exam_id: '',
    score: 0,
  });

  // Enable real-time notifications
  useRealtimeNotifications();

  const handleSubmit = async () => {
    const success = editingPerformance
      ? await updateStudentExam(editingPerformance.id, {
          score: formData.score,
        })
      : await addStudentExam(formData);

    if (success) {
      setIsDialogOpen(false);
      setEditingPerformance(null);
      setFormData({ student_id: '', exam_id: '', score: 0 });
    }
  };

  const handleEdit = (performance: StudentExamWithDetails) => {
    setEditingPerformance(performance);
    setFormData({
      student_id: performance.student_id,
      exam_id: performance.exam_id,
      score: performance.score || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteStudentExam(id);
    if (success) {
      setDeleteConfirm(null);
    }
  };

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

  const filteredPerformances = studentExams.filter(
    (performance) =>
      performance.student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      performance.exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedExam = exams.find((e) => e.id === formData.exam_id);
  const maxScore = selectedExam?.total_score || 100;

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
                <TrendingUp className='h-6 w-6 mr-2' />
                إدارة الأداء والدرجات
              </h1>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='bg-blue-600 hover:bg-blue-700'>
                  <Plus className='h-4 w-4 mr-2' />
                  تسجيل نتيجة
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[500px] bg-white border-0 shadow-2xl'>
                <DialogHeader className='pb-6 border-b border-gray-100'>
                  <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center'>
                    <Trophy className='h-6 w-6 mr-3 text-blue-600' />
                    {editingPerformance ? 'تعديل النتيجة' : 'تسجيل نتيجة جديدة'}
                  </DialogTitle>
                </DialogHeader>
                <div className='grid gap-6 py-6'>
                  <div className='grid gap-3'>
                    <Label
                      htmlFor='student_id'
                      className='text-sm font-semibold text-gray-700'
                    >
                      الطالب
                    </Label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, student_id: value }))
                      }
                      disabled={!!editingPerformance}
                    >
                      <SelectTrigger className='h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500'>
                        <SelectValue placeholder='اختر الطالب' />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-gray-200 shadow-lg'>
                        {students.map((student) => (
                          <SelectItem
                            key={student.id}
                            value={student.id}
                            className='hover:bg-blue-50'
                          >
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='grid gap-3'>
                    <Label
                      htmlFor='exam_id'
                      className='text-sm font-semibold text-gray-700'
                    >
                      الامتحان
                    </Label>
                    <Select
                      value={formData.exam_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, exam_id: value }))
                      }
                      disabled={!!editingPerformance}
                    >
                      <SelectTrigger className='h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500'>
                        <SelectValue placeholder='اختر الامتحان' />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-gray-200 shadow-lg'>
                        {exams.map((exam) => (
                          <SelectItem
                            key={exam.id}
                            value={exam.id}
                            className='hover:bg-blue-50'
                          >
                            {exam.title} (من {exam.total_score})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='grid gap-3'>
                    <Label
                      htmlFor='score'
                      className='text-sm font-semibold text-gray-700'
                    >
                      الدرجة {selectedExam && `(من ${maxScore})`}
                    </Label>
                    <Input
                      id='score'
                      type='number'
                      min='0'
                      max={maxScore}
                      placeholder='أدخل الدرجة'
                      value={formData.score}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          score: parseInt(e.target.value) || 0,
                        }))
                      }
                      className={`h-11 focus:ring-blue-500 ${
                        formData.score > maxScore
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                    />

                    {/* تحذير عند تجاوز الدرجة الكلية */}
                    {formData.score > maxScore && selectedExam && (
                      <div className='flex items-center p-3 bg-red-50 border border-red-200 rounded-lg'>
                        <div className='flex-shrink-0'>
                          <svg
                            className='h-5 w-5 text-red-400'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </div>
                        <div className='ml-3'>
                          <p className='text-sm text-red-800'>
                            <strong>تحذير:</strong> الدرجة المدخلة (
                            {formData.score}) أعلى من الدرجة الكلية للامتحان (
                            {maxScore})
                          </p>
                        </div>
                      </div>
                    )}

                    {/* عرض النسبة المئوية */}
                    {selectedExam &&
                      formData.score > 0 &&
                      formData.score <= maxScore && (
                        <div className='flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                          <div className='flex-shrink-0'>
                            <svg
                              className='h-5 w-5 text-blue-400'
                              viewBox='0 0 20 20'
                              fill='currentColor'
                            >
                              <path
                                fillRule='evenodd'
                                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                          <div className='ml-3'>
                            <p className='text-sm text-blue-800'>
                              النسبة المئوية:{' '}
                              <strong>
                                {((formData.score / maxScore) * 100).toFixed(1)}
                                %
                              </strong>
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
                <div className='flex justify-end gap-3 pt-6 border-t border-gray-100'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingPerformance(null);
                      setFormData({ student_id: '', exam_id: '', score: 0 });
                    }}
                    className='px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !formData.student_id ||
                      !formData.exam_id ||
                      formData.score < 0 ||
                      formData.score > maxScore
                    }
                    className='px-6 py-2 h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {editingPerformance ? 'تحديث' : 'تسجيل النتيجة'}
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
                placeholder='البحث في النتائج...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            <div className='flex items-center space-x-4 text-sm text-gray-600'>
              <span>المجموع: {studentExams.length} نتيجة</span>
              <span>•</span>
              <span>المعروض: {filteredPerformances.length}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='p-2 rounded-lg bg-blue-500'>
                  <FileText className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    إجمالي النتائج
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {studentExams.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='p-2 rounded-lg bg-green-500'>
                  <Award className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    متفوقون (80%+)
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {
                      studentExams.filter(
                        (se) => se.percentage && se.percentage >= 80
                      ).length
                    }
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='p-2 rounded-lg bg-yellow-500'>
                  <Trophy className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    متوسط الدرجات
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {studentExams.length > 0
                      ? studentExams
                          .filter((se) => se.percentage)
                          .reduce((sum, se) => sum + (se.percentage || 0), 0) /
                        studentExams.filter((se) => se.percentage).length
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center'>
                <div className='p-2 rounded-lg bg-red-500'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    يحتاج تحسين
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {
                      studentExams.filter(
                        (se) => se.percentage && se.percentage < 60
                      ).length
                    }
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Performance Table */}
        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-gray-600'>جاري تحميل النتائج...</p>
            </div>
          </div>
        ) : filteredPerformances.length === 0 ? (
          <div className='text-center py-12'>
            <TrendingUp className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              لا يوجد نتائج
            </h3>
            <p className='text-gray-600'>
              قم بتسجيل نتائج جديدة أو تعديل البحث
            </p>
          </div>
        ) : (
          <Card className='overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>
                      الطالب
                    </th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>
                      الامتحان
                    </th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>
                      الدرجة
                    </th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>
                      النسبة المئوية
                    </th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>
                      التاريخ
                    </th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPerformances.map((performance) => (
                    <motion.tr
                      key={performance.id}
                      className='border-b hover:bg-gray-50'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className='py-3 px-4 font-medium text-gray-900'>
                        {performance.student.name}
                      </td>
                      <td className='py-3 px-4 text-gray-900'>
                        {performance.exam.title}
                      </td>
                      <td className='py-3 px-4 text-gray-900'>
                        {performance.score !== null
                          ? `${performance.score}/${performance.exam.total_score}`
                          : 'لم يؤدِ الامتحان'}
                      </td>
                      <td className='py-3 px-4'>
                        {performance.percentage !== undefined && (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceBg(performance.percentage)} ${getPerformanceColor(performance.percentage)}`}
                          >
                            {performance.percentage.toFixed(1)}%
                          </span>
                        )}
                      </td>
                      <td className='py-3 px-4 text-gray-600'>
                        {new Date(performance.taken_at).toLocaleDateString(
                          'ar-EG'
                        )}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEdit(performance)}
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>تأكيد الحذف</h3>
            <p className='text-gray-600 mb-6'>
              هل أنت متأكد من حذف هذه النتيجة؟ لا يمكن التراجع عن هذا الإجراء.
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
