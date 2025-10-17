// src/app/auth/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
      });

      if (error) throw error;
      setMessage('Check your email for the password reset link');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md'
      >
        <Card className='p-8 bg-white/10 backdrop-blur-lg border-white/20'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Reset Password
            </h1>
            <p className='text-gray-300'>
              Enter your email to receive a reset link
            </p>
          </div>

          {error && (
            <Alert variant='destructive' className='mb-6'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className='mb-6 bg-green-500/10 border-green-500/20'>
              <AlertDescription className='text-green-400'>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleResetPassword} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-white'>
                Email
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                  placeholder='Enter your email'
                  required
                />
              </div>
            </div>

            <Button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white'
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <Link
              href='/auth/login'
              className='inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to login
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
