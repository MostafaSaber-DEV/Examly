-- Enable RLS on exams table
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only see published exams assigned to them
CREATE POLICY "exams_student_select" ON exams
  FOR SELECT
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'student'
    ) AND
    EXISTS (
      SELECT 1 FROM exam_assignments ea
      WHERE ea.exam_id = exams.id AND ea.student_id = auth.uid()
    )
  );

-- Policy: Instructors can see their own exams
CREATE POLICY "exams_instructor_select_own" ON exams
  FOR SELECT
  USING (
    instructor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin')
    )
  );

-- Policy: Instructors can create exams
CREATE POLICY "exams_instructor_insert" ON exams
  FOR INSERT
  WITH CHECK (
    instructor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin')
    )
  );

-- Policy: Instructors can update their own exams
CREATE POLICY "exams_instructor_update_own" ON exams
  FOR UPDATE
  USING (
    instructor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin')
    )
  );

-- Policy: Admins can see all exams
CREATE POLICY "exams_admin_all" ON exams
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Test queries
-- Test 1: Student sees only assigned published exams
-- SELECT * FROM exams; -- Should return only assigned published exams for students

-- Test 2: Instructor sees own exams
-- SELECT * FROM exams WHERE instructor_id = auth.uid(); -- Should return instructor's exams

-- Test 3: Student cannot see unpublished exams
-- SELECT * FROM exams WHERE is_published = false; -- Should return empty for students