export interface Student {
  id: string;
  name: string;
  phone: string;
  academic_year: string;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  total_score: number;
  created_at: string;
}

export interface StudentExam {
  id: string;
  student_id: string;
  exam_id: string;
  score: number | null;
  taken_at: string;
}

export interface StudentExamWithDetails extends StudentExam {
  student: Student;
  exam: Exam;
  percentage?: number | undefined;
}
