'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export function useRealtimeNotifications() {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const { table, eventType, new: newRecord } = payload;

        switch (table) {
          case 'students':
            if (eventType === 'INSERT') {
              toast.success(`🎉 New student added: ${newRecord.name}`);
            } else if (eventType === 'UPDATE') {
              toast(`✏️ Student updated: ${newRecord.name}`);
            } else if (eventType === 'DELETE') {
              toast.error(`🗑️ Student deleted`);
            }
            break;

          case 'exams':
            if (eventType === 'INSERT') {
              toast.success(`📝 New exam created: ${newRecord.title}`);
            } else if (eventType === 'UPDATE') {
              toast(`✏️ Exam updated: ${newRecord.title}`);
            } else if (eventType === 'DELETE') {
              toast.error(`🗑️ Exam deleted`);
            }
            break;

          case 'student_exams':
            if (eventType === 'INSERT') {
              toast.success(`📊 New exam result recorded`);
            } else if (eventType === 'UPDATE') {
              toast(`✏️ Exam result updated`);
            } else if (eventType === 'DELETE') {
              toast.error(`🗑️ Exam result deleted`);
            }
            break;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);
}
