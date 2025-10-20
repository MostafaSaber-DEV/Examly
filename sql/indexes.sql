-- Database Performance Indexes
-- Run these commands in your Supabase SQL editor

-- Students table indexes
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone);
CREATE INDEX IF NOT EXISTS idx_students_academic_year ON students(academic_year);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);

-- Exams table indexes
CREATE INDEX IF NOT EXISTS idx_exams_title ON exams(title);
CREATE INDEX IF NOT EXISTS idx_exams_created_at ON exams(created_at);
CREATE INDEX IF NOT EXISTS idx_exams_total_score ON exams(total_score);

-- Student exams table indexes
CREATE INDEX IF NOT EXISTS idx_student_exams_student_id ON student_exams(student_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_exam_id ON student_exams(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_taken_at ON student_exams(taken_at);
CREATE INDEX IF NOT EXISTS idx_student_exams_score ON student_exams(score);
CREATE INDEX IF NOT EXISTS idx_student_exams_student_exam ON student_exams(student_id, exam_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_student_exams_student_taken ON student_exams(student_id, taken_at);
CREATE INDEX IF NOT EXISTS idx_student_exams_exam_taken ON student_exams(exam_id, taken_at);

-- Partial indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_exams_score_not_null ON student_exams(score) WHERE score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_recent ON students(created_at) WHERE created_at > NOW() - INTERVAL '30 days';

-- Text search indexes (if using PostgreSQL full-text search)
CREATE INDEX IF NOT EXISTS idx_students_name_search ON students USING gin(to_tsvector('arabic', name));
CREATE INDEX IF NOT EXISTS idx_exams_title_search ON exams USING gin(to_tsvector('arabic', title));

-- Statistics update
ANALYZE students;
ANALYZE exams;
ANALYZE student_exams;

