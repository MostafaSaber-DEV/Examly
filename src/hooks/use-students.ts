'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Student } from '@/types/entities';
import { Database } from '@/types/supabase';
import toast from 'react-hot-toast';

// Supabase generated types for type-safe operations
type StudentInsert = Database['public']['Tables']['students']['Insert'];
type StudentUpdate = Database['public']['Tables']['students']['Update'];

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (student: Omit<Student, 'id' | 'created_at'>) => {
    try {
      // Check for duplicate phone number
      const { data: existing } = await supabase
        .from('students')
        .select('id')
        .eq('phone', student.phone);

      if (existing && existing.length > 0) {
        toast.error('⚠️ This phone number is already registered!');
        return false;
      }

      // Create properly typed insert data
      const insertData: StudentInsert = {
        name: student.name,
        phone: student.phone,
        academic_year: student.academic_year,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('students')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      setStudents((prev) => [data, ...prev]);
      return true;
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
      return false;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      // Check for duplicate phone number if phone is being updated
      if (updates.phone) {
        const { data: existing } = await supabase
          .from('students')
          .select('id')
          .eq('phone', updates.phone)
          .neq('id', id);

        if (existing && existing.length > 0) {
          toast.error('⚠️ This phone number is already registered!');
          return false;
        }
      }

      // Create properly typed update data
      const updateData: StudentUpdate = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.academic_year !== undefined)
        updateData.academic_year = updates.academic_year;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setStudents((prev) => prev.map((s) => (s.id === id ? data : s)));
      return true;
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
      return false;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);

      if (error) throw error;
      setStudents((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
      return false;
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    students,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents,
  };
}
