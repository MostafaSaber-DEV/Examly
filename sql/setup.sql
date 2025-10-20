-- Education Management Database Setup
-- Run these commands in your Supabase SQL editor

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_exams table
CREATE TABLE IF NOT EXISTS student_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  score NUMERIC(5,2),
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (student_id, exam_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_exams ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON students
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON exams
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON student_exams
  FOR ALL USING (auth.role() = 'authenticated');

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE exams;
ALTER PUBLICATION supabase_realtime ADD TABLE student_exams;

-- Insert sample data (optional)
INSERT INTO students (name, phone, academic_year) VALUES
  ('John Doe', '+1234567890', '2024-2025'),
  ('Jane Smith', '+1234567891', '2024-2025'),
  ('Bob Johnson', '+1234567892', '2023-2024')
ON CONFLICT (phone) DO NOTHING;

INSERT INTO exams (title, total_score) VALUES
  ('Mathematics Final', 100),
  ('Physics Midterm', 80),
  ('Chemistry Quiz', 50)
ON CONFLICT DO NOTHING;