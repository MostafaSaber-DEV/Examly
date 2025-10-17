import { redirect } from 'next/navigation';

export async function requireAuth() {
  // Mock auth - implement with your auth solution
  const isAuthenticated = false;
  if (!isAuthenticated) {
    redirect('/signin');
  }
  return { user: { id: '1', email: 'user@example.com' } };
}

export async function getSession() {
  // Mock session - implement with your auth solution
  return null;
}
