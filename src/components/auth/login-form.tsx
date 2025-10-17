'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validatePassword } from '@/lib/auth/password-validation';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Client-side validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors[0] || 'Password validation failed');
        return;
      }

      // Check for breached password (optional warning)
      // Password validation passed

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) {
        setAttempts((prev) => prev + 1);

        // Show CAPTCHA after 3 attempts
        if (attempts >= 2) {
          setShowCaptcha(true);
        }

        setError(authError.message);
        return;
      }

      if (data.user) {
        // Redirect to dashboard
        router.push(redirectTo);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'azure') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700'
          >
            Email
          </label>
          <Input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='mt-1'
            placeholder='Enter your email'
          />
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700'
          >
            Password
          </label>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='mt-1'
            placeholder='Enter your password'
          />
        </div>

        {showCaptcha && (
          <div className='flex justify-center'>
            {/* CAPTCHA component would go here */}
            <div className='text-sm text-gray-600'>
              CAPTCHA verification required after multiple attempts
            </div>
          </div>
        )}

        {error && <div className='text-red-600 text-sm'>{error}</div>}

        <Button type='submit' disabled={loading} className='w-full'>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className='mt-6'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='mt-6 grid grid-cols-3 gap-3'>
          <Button
            variant='secondary'
            onClick={() => handleOAuthLogin('google')}
            className='w-full'
          >
            Google
          </Button>
          <Button
            variant='secondary'
            onClick={() => handleOAuthLogin('github')}
            className='w-full'
          >
            GitHub
          </Button>
          <Button
            variant='secondary'
            onClick={() => handleOAuthLogin('azure')}
            className='w-full'
          >
            Microsoft
          </Button>
        </div>
      </div>

      <div className='mt-6 text-center'>
        <a
          href='/auth/forgot-password'
          className='text-sm text-blue-600 hover:text-blue-500'
        >
          Forgot your password?
        </a>
      </div>
    </div>
  );
}
