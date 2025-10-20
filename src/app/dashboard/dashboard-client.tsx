// src/app/dashboard/dashboard-client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, LogOut, Users, FileText, TrendingUp } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface DashboardClientProps {
  user: SupabaseUser;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const userName =
    user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-gray-900'>
                Education Dashboard
              </h1>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-3'>
                <div className='flex items-center space-x-2'>
                  <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                    <User className='h-4 w-4 text-white' />
                  </div>
                  <span className='text-sm font-medium text-gray-700'>
                    {userName}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  disabled={loading}
                  variant='outline'
                  size='sm'
                >
                  <LogOut className='h-4 w-4 mr-2' />
                  {loading ? 'Signing out...' : 'Logout'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>
            مرحباً بك، {userName}! 👋
          </h2>
          <p className='text-gray-600'>
            نظام إدارة التعليم - اختر القسم الذي تريد إدارته
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <Link href='/students'>
            <Card className='p-8 hover:shadow-lg transition-shadow duration-200 cursor-pointer group'>
              <div className='text-center'>
                <div className='mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors'>
                  <Users className='h-8 w-8 text-white' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>
                  إدارة الطلاب
                </h3>
                <p className='text-gray-600 mb-4'>إضافة وتعديل وحذف الطلاب</p>
                <Button className='w-full'>إدارة الطلاب</Button>
              </div>
            </Card>
          </Link>

          <Link href='/exams'>
            <Card className='p-8 hover:shadow-lg transition-shadow duration-200 cursor-pointer group'>
              <div className='text-center'>
                <div className='mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors'>
                  <FileText className='h-8 w-8 text-white' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>
                  إدارة الامتحانات
                </h3>
                <p className='text-gray-600 mb-4'>إنشاء وتعديل الامتحانات</p>
                <Button className='w-full'>إدارة الامتحانات</Button>
              </div>
            </Card>
          </Link>

          <Link href='/performance'>
            <Card className='p-8 hover:shadow-lg transition-shadow duration-200 cursor-pointer group'>
              <div className='text-center'>
                <div className='mx-auto w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors'>
                  <TrendingUp className='h-8 w-8 text-white' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>
                  إدارة الأداء
                </h3>
                <p className='text-gray-600 mb-4'>تسجيل ومتابعة الدرجات</p>
                <Button className='w-full'>إدارة الأداء</Button>
              </div>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
