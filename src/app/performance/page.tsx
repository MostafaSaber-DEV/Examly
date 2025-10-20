// src/app/performance/page.tsx
import { requireAuth } from '@/lib/auth/authHelpers';
import PerformanceClient from './performance-client';

export default async function PerformancePage() {
  const user = await requireAuth();

  return <PerformanceClient user={user} />;
}
