'use client';

import { Card } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Award } from 'lucide-react';
import { Student, Exam, StudentExamWithDetails } from '@/types/entities';

interface DashboardStatsProps {
  students: Student[];
  exams: Exam[];
  studentExams: StudentExamWithDetails[];
}

export function DashboardStats({
  students,
  exams,
  studentExams,
}: DashboardStatsProps) {
  const totalStudents = students.length;
  const totalExams = exams.length;

  const completedExams = studentExams.filter((se) => se.score !== null).length;
  const averageScore =
    studentExams.length > 0
      ? studentExams
          .filter((se) => se.score !== null)
          .reduce((sum, se) => sum + (se.percentage || 0), 0) / completedExams
      : 0;

  const topPerformers = studentExams.filter(
    (se) => se.percentage && se.percentage >= 80
  ).length;

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Exams',
      value: totalExams.toString(),
      icon: FileText,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Average Score',
      value: `${averageScore.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+5%',
    },
    {
      title: 'Top Performers',
      value: topPerformers.toString(),
      icon: Award,
      color: 'bg-orange-500',
      change: '+15%',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {stats.map((stat) => (
        <Card key={stat.title} className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                {stat.title}
              </p>
              <p className='text-3xl font-bold text-gray-900'>{stat.value}</p>
              <p className='text-sm text-green-600 mt-1'>
                {stat.change} from last month
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className='h-6 w-6 text-white' />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
