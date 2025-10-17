// src/app/dashboard/dashboard-client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  User,
  LogOut,
  Activity,
  Users,
  TrendingUp,
  Settings,
  Bell,
  Search,
} from 'lucide-react';
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

  const stats = [
    { title: 'Active Bots', value: '12', icon: Activity, color: 'bg-blue-500' },
    {
      title: 'Total Users',
      value: '1,234',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Usage Today',
      value: '89%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    { title: 'Plan', value: 'Pro', icon: Settings, color: 'bg-orange-500' },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
            </div>

            <div className='flex items-center space-x-4'>
              <Button variant='outline' size='sm'>
                <Search className='h-4 w-4 mr-2' />
                Search
              </Button>
              <Button variant='outline' size='sm'>
                <Bell className='h-4 w-4' />
              </Button>
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

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>
            Welcome back, {userName}! 👋
          </h2>
          <p className='text-gray-600'>
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'
        >
          {stats.map((stat) => (
            <Card key={stat.title} className='p-6'>
              <div className='flex items-center'>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className='h-6 w-6 text-white' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Recent Activity
              </h3>
              <div className='space-y-4'>
                {[
                  {
                    action: 'Bot deployed',
                    time: '2 minutes ago',
                    status: 'success',
                  },
                  {
                    action: 'User registered',
                    time: '5 minutes ago',
                    status: 'info',
                  },
                  {
                    action: 'Payment processed',
                    time: '1 hour ago',
                    status: 'success',
                  },
                  {
                    action: 'System maintenance',
                    time: '2 hours ago',
                    status: 'warning',
                  },
                ].map((activity, activityIndex) => (
                  <div
                    key={activityIndex}
                    className='flex items-center justify-between py-2'
                  >
                    <div className='flex items-center'>
                      <div
                        className={`w-2 h-2 rounded-full mr-3 ${
                          activity.status === 'success'
                            ? 'bg-green-500'
                            : activity.status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                        }`}
                      />
                      <span className='text-sm text-gray-900'>
                        {activity.action}
                      </span>
                    </div>
                    <span className='text-xs text-gray-500'>
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Quick Actions
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                {[
                  { title: 'Deploy Bot', icon: Activity, color: 'bg-blue-500' },
                  { title: 'Add User', icon: Users, color: 'bg-green-500' },
                  {
                    title: 'View Analytics',
                    icon: TrendingUp,
                    color: 'bg-purple-500',
                  },
                  { title: 'Settings', icon: Settings, color: 'bg-gray-500' },
                ].map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant='outline'
                    className='h-20 flex-col space-y-2 hover:bg-gray-50'
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className='h-4 w-4 text-white' />
                    </div>
                    <span className='text-xs'>{action.title}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='mt-8'
        >
          <Card className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Account Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Name
                </label>
                <p className='text-gray-900'>{userName}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Email
                </label>
                <p className='text-gray-900'>{user.email}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Account Created
                </label>
                <p className='text-gray-900'>
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Last Sign In
                </label>
                <p className='text-gray-900'>
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
