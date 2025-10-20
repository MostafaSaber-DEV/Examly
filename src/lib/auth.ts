import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function requireAuth() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logger.error('Auth error:', error);
      redirect('/auth/login');
    }

    if (!user) {
      redirect('/auth/login');
    }

    return user;
  } catch (error) {
    logger.error('Auth check failed:', error);
    redirect('/auth/login');
  }
}

export async function getSession() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      logger.error('Session error:', error);
      return null;
    }

    return session;
  } catch (error) {
    logger.error('Session check failed:', error);
    return null;
  }
}

export async function redirectIfAuthenticated() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect('/dashboard');
    }
  } catch (error) {
    logger.error('Auth redirect check failed:', error);
  }
}
