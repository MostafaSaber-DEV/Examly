'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentExam, StudentExamWithDetails } from '@/types/entities';
import { Database } from '@/types/supabase';
import toast from 'react-hot-toast';

// Supabase generated types
type StudentExamInsert =
  Database['public']['Tables']['student_exams']['Insert'];
type StudentExamUpdate =
  Database['public']['Tables']['student_exams']['Update'];

// Typed interfaces for joined data
interface StudentExamJoined {
  id: string;
  student_id: string;
  exam_id: string;
  score: number | null;
  taken_at: string;
  student: {
    id: string;
    name: string;
    phone: string;
    academic_year: string;
    created_at: string;
  };
  exam: {
    id: string;
    title: string;
    total_score: number;
    created_at: string;
  };
}

export function useStudentExams() {
  const [studentExams, setStudentExams] = useState<StudentExamWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchStudentExams = async () => {
    try {
      const { data, error } = await supabase
        .from('student_exams')
        .select(
          `
          *,
          student:students(*),
          exam:exams(*)
        `
        )
        .order('taken_at', { ascending: false });

      if (error) throw error;

      // Type-safe mapping with proper interface
      const formattedData: StudentExamWithDetails[] = (
        (data as StudentExamJoined[]) || []
      ).map((item) => ({
        ...item,
        percentage:
          item.score && item.exam
            ? (item.score / item.exam.total_score) * 100
            : undefined,
      }));

      setStudentExams(formattedData);
    } catch (error) {
      console.error('Error fetching student exams:', error);
      toast.error('Failed to fetch student exams');
    } finally {
      setLoading(false);
    }
  };

  const addStudentExam = async (
    studentExam: Omit<StudentExam, 'id' | 'taken_at'>
  ) => {
    try {
      // Check if student already took this exam
      const { data: existing } = await supabase
        .from('student_exams')
        .select('id')
        .eq('student_id', studentExam.student_id)
        .eq('exam_id', studentExam.exam_id);

      if (existing && existing.length > 0) {
        toast.error('الطالب أدى هذا الامتحان من قبل');
        return false;
      }

      // Get exam details to validate score
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('total_score')
        .eq('id', studentExam.exam_id)
        .single();

      if (examError) throw examError;

      // Type-safe validation with proper null checking
      if (
        examData &&
        studentExam.score !== null &&
        studentExam.score !== undefined &&
        studentExam.score > (examData as { total_score: number }).total_score
      ) {
        toast.error(
          `⚠️ الدرجة المدخلة (${studentExam.score}) أعلى من الدرجة الكلية للامتحان (${(examData as { total_score: number }).total_score})`
        );
        return false;
      }

      // Create properly typed insert data
      const insertData: StudentExamInsert = {
        student_id: studentExam.student_id,
        exam_id: studentExam.exam_id,
        score: studentExam.score,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('student_exams')
        .insert(insertData)
        .select(
          `
          *,
          student:students(*),
          exam:exams(*)
        `
        )
        .single();

      if (error) throw error;

      // Type-safe data handling
      const joinedData = data as StudentExamJoined;
      const formattedData: StudentExamWithDetails = {
        ...joinedData,
        percentage:
          joinedData.score && joinedData.exam
            ? (joinedData.score / joinedData.exam.total_score) * 100
            : undefined,
      };

      setStudentExams((prev) => [formattedData, ...prev]);
      return true;
    } catch (error) {
      console.error('Error adding student exam:', error);
      toast.error('فشل في تسجيل نتيجة الامتحان');
      return false;
    }
  };

  const updateStudentExam = async (
    id: string,
    updates: Partial<StudentExam>
  ) => {
    try {
      // Get current exam details to validate score
      const { data: currentData } = await supabase
        .from('student_exams')
        .select(
          `
          *,
          exam:exams(total_score)
        `
        )
        .eq('id', id)
        .single();

      // Type-safe validation
      if (
        currentData &&
        updates.score !== null &&
        updates.score !== undefined
      ) {
        const typedCurrentData = currentData as {
          exam: { total_score: number };
        };
        if (
          typedCurrentData.exam &&
          updates.score > typedCurrentData.exam.total_score
        ) {
          toast.error(
            `⚠️ الدرجة المدخلة (${updates.score}) أعلى من الدرجة الكلية للامتحان (${typedCurrentData.exam.total_score})`
          );
          return false;
        }
      }

      // Create properly typed update data
      const updateData: StudentExamUpdate = {};
      if (updates.score !== undefined) updateData.score = updates.score;
      if (updates.taken_at !== undefined)
        updateData.taken_at = updates.taken_at;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('student_exams')
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          student:students(*),
          exam:exams(*)
        `
        )
        .single();

      if (error) throw error;

      // Type-safe data handling
      const joinedData = data as StudentExamJoined;
      const formattedData: StudentExamWithDetails = {
        ...joinedData,
        percentage:
          joinedData.score && joinedData.exam
            ? (joinedData.score / joinedData.exam.total_score) * 100
            : undefined,
      };

      setStudentExams((prev) =>
        prev.map((se) => (se.id === id ? formattedData : se))
      );
      return true;
    } catch (error) {
      console.error('Error updating student exam:', error);
      toast.error('فشل في تحديث نتيجة الامتحان');
      return false;
    }
  };

  const deleteStudentExam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('student_exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStudentExams((prev) => prev.filter((se) => se.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting student exam:', error);
      toast.error('Failed to delete exam result');
      return false;
    }
  };

  useEffect(() => {
    fetchStudentExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    studentExams,
    loading,
    addStudentExam,
    updateStudentExam,
    deleteStudentExam,
    refetch: fetchStudentExams,
  };
}
