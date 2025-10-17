// src/app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/authHelpers';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const user = await requireAuth();

  return <DashboardClient user={user} />;
}
