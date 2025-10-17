export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'student' | 'instructor' | 'admin';
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          mfa_enabled: boolean;
          mfa_secret: string | null;
          backup_codes: string[] | null;
          last_login_at: string | null;
          login_attempts: number;
          locked_until: string | null;
          ip_whitelist: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'student' | 'instructor' | 'admin';
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          mfa_enabled?: boolean;
          mfa_secret?: string | null;
          backup_codes?: string[] | null;
          last_login_at?: string | null;
          login_attempts?: number;
          locked_until?: string | null;
          ip_whitelist?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          role?: 'student' | 'instructor' | 'admin';
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          mfa_enabled?: boolean;
          mfa_secret?: string | null;
          backup_codes?: string[] | null;
          last_login_at?: string | null;
          login_attempts?: number;
          locked_until?: string | null;
          ip_whitelist?: string[] | null;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          device_fingerprint: string;
          ip_address: string;
          user_agent: string;
          location: string | null;
          expires_at: string;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_fingerprint: string;
          ip_address: string;
          user_agent: string;
          location?: string | null;
          expires_at: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          expires_at?: string;
          revoked_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource: string | null;
          ip_address: string;
          user_agent: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource?: string | null;
          ip_address: string;
          user_agent: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: never;
      };
      exams: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          instructor_id: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          max_attempts: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          instructor_id: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          max_attempts?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          duration_minutes?: number;
          max_attempts?: number;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      exam_results: {
        Row: {
          id: string;
          exam_id: string;
          student_id: string;
          score: number;
          max_score: number;
          attempt_number: number;
          started_at: string;
          completed_at: string | null;
          answers: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          student_id: string;
          score?: number;
          max_score: number;
          attempt_number: number;
          started_at: string;
          completed_at?: string | null;
          answers?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          score?: number;
          completed_at?: string | null;
          answers?: Record<string, unknown>;
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
      user_role: 'student' | 'instructor' | 'admin';
    };
  };
}
