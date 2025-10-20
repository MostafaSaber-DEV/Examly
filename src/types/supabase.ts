export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          name: string;
          phone: string;
          academic_year: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          academic_year: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          academic_year?: string;
        };
      };
      exams: {
        Row: {
          id: string;
          title: string;
          total_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          total_score: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          total_score?: number;
        };
      };
      student_exams: {
        Row: {
          id: string;
          student_id: string;
          exam_id: string;
          score: number | null;
          taken_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          exam_id: string;
          score?: number | null;
          taken_at?: string;
        };
        Update: {
          score?: number | null;
          taken_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
