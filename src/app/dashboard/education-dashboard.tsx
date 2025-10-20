'use client';

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStudents } from '@/hooks/use-students';
import { useExams } from '@/hooks/use-exams';
import { useStudentExams } from '@/hooks/use-student-exams';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { StudentsTable } from '@/components/students/students-table';
import { ExamsTable } from '@/components/exams/exams-table';
import { StudentPerformance } from '@/components/dashboard/student-performance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, FileText, TrendingUp, BarChart3 } from 'lucide-react';

type TabType = 'overview' | 'students' | 'exams' | 'performance';

export default function EducationDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Initialize hooks
  const {
    students,
    loading: studentsLoading,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useStudents();
  const {
    exams,
    loading: examsLoading,
    addExam,
    updateExam,
    deleteExam,
  } = useExams();
  const {
    studentExams,
    loading: performanceLoading,
    addStudentExam,
    updateStudentExam,
    deleteStudentExam,
  } = useStudentExams();

  // Enable real-time notifications
  useRealtimeNotifications();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'exams', label: 'Exams', icon: FileText },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className='space-y-8'>
            <DashboardStats
              students={students}
              exams={exams}
              studentExams={studentExams}
            />

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <Card className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Recent Students</h3>
                <div className='space-y-3'>
                  {students.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className='flex justify-between items-center py-2 border-b last:border-b-0'
                    >
                      <div>
                        <p className='font-medium'>{student.name}</p>
                        <p className='text-sm text-gray-600'>
                          {student.academic_year}
                        </p>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {new Date(student.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <p className='text-gray-500 text-center py-4'>
                      No students added yet
                    </p>
                  )}
                </div>
              </Card>

              <Card className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Recent Exams</h3>
                <div className='space-y-3'>
                  {exams.slice(0, 5).map((exam) => (
                    <div
                      key={exam.id}
                      className='flex justify-between items-center py-2 border-b last:border-b-0'
                    >
                      <div>
                        <p className='font-medium'>{exam.title}</p>
                        <p className='text-sm text-gray-600'>
                          Total Score: {exam.total_score}
                        </p>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {new Date(exam.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {exams.length === 0 && (
                    <p className='text-gray-500 text-center py-4'>
                      No exams added yet
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );

      case 'students':
        return (
          <StudentsTable
            students={students}
            loading={studentsLoading}
            onAdd={addStudent}
            onUpdate={updateStudent}
            onDelete={deleteStudent}
          />
        );

      case 'exams':
        return (
          <ExamsTable
            exams={exams}
            loading={examsLoading}
            onAdd={addExam}
            onUpdate={updateExam}
            onDelete={deleteExam}
          />
        );

      case 'performance':
        return (
          <StudentPerformance
            studentExams={studentExams}
            students={students}
            exams={exams}
            loading={performanceLoading}
            onAdd={addStudentExam}
            onUpdate={updateStudentExam}
            onDelete={deleteStudentExam}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Toaster position='top-right' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Education Management Dashboard
          </h1>
          <p className='text-gray-600'>
            Manage students, exams, and track performance in real-time
          </p>
        </div>

        <div className='mb-8'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8'>
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant='ghost'
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className='h-5 w-5 mr-2' />
                  {tab.label}
                </Button>
              ))}
            </nav>
          </div>
        </div>

        <div className='mb-8'>{renderContent()}</div>
      </div>
    </div>
  );
}
