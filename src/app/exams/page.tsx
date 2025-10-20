import ExamsClient from './exams-client';
import type { User } from '@supabase/supabase-js';

export default function ExamsPage() {
  const mockUser: Partial<User> = {
    id: 'demo-user',
    email: 'demo@example.com',
  };

  return <ExamsClient user={mockUser as User} />;
}
