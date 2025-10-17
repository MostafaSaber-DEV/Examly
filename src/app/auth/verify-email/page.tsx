// src/app/auth/verify-email/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md'
      >
        <Card className='p-8 bg-white/10 backdrop-blur-lg border-white/20 text-center'>
          <div className='mb-8'>
            <div className='mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4'>
              <Mail className='h-8 w-8 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Check Your Email
            </h1>
            <p className='text-gray-300'>
              We&apos;ve sent a verification link to your email address. Please
              check your inbox and click the link to verify your account.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-center space-x-2 text-green-400'>
              <CheckCircle className='h-5 w-5' />
              <span className='text-sm'>Email sent successfully</span>
            </div>

            <p className='text-sm text-gray-400'>
              Didn&apos;t receive the email? Check your spam folder or contact
              support.
            </p>

            <Link href='/auth/login'>
              <Button className='w-full bg-blue-600 hover:bg-blue-700 text-white'>
                Back to Login
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
