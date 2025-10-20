// src/app/students/page.tsx
import { requireAuth } from '@/lib/auth/authHelpers';
import StudentsClient from './students-client';

export default async function StudentsPage() {
  const user = await requireAuth();

  return <StudentsClient user={user} />;
}
