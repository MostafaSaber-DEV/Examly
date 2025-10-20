'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Exam } from '@/types/entities';
import { Database } from '@/types/supabase';
import toast from 'react-hot-toast';

// Supabase generated types for type-safe operations
type ExamInsert = Database['public']['Tables']['exams']['Insert'];
type ExamUpdate = Database['public']['Tables']['exams']['Update'];

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const addExam = async (exam: Omit<Exam, 'id' | 'created_at'>) => {
    try {
      setLoading(true);

      // Create properly typed insert data
      const insertData: ExamInsert = {
        title: exam.title,
        total_score: exam.total_score,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('exams')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      setExams((prev) => [data, ...prev]);
      toast.success('Exam added successfully');
      return true;
    } catch (error) {
      console.error('Error adding exam:', error);
      toast.error('Failed to add exam');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateExam = async (id: string, updates: Partial<Exam>) => {
    try {
      setLoading(true);

      // Create properly typed update data
      const updateData: ExamUpdate = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.total_score !== undefined)
        updateData.total_score = updates.total_score;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('exams')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setExams((prev) => prev.map((e) => (e.id === id ? data : e)));
      toast.success('Exam updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Failed to update exam');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async (id: string) => {
    try {
      setLoading(true);

      const { error } = await supabase.from('exams').delete().eq('id', id);

      if (error) throw error;
      setExams((prev) => prev.filter((e) => e.id !== id));
      toast.success('Exam deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    exams,
    loading,
    addExam,
    updateExam,
    deleteExam,
    refetch: fetchExams,
  };
}
