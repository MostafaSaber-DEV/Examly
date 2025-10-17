// src/app/auth/loading/page.tsx
'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function AuthLoadingPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='text-center'
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className='mx-auto mb-4'
        >
          <Loader2 className='h-12 w-12 text-blue-500' />
        </motion.div>
        <h2 className='text-xl font-semibold text-white mb-2'>Loading...</h2>
        <p className='text-gray-400'>
          Please wait while we process your request
        </p>
      </motion.div>
    </div>
  );
}
