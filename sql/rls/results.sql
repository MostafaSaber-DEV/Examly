-- Enable RLS on exam_results table
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only see their own results
CREATE POLICY "results_student_select_own" ON exam_results
  FOR SELECT
  USING (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Policy: Students can insert their own results
CREATE POLICY "results_student_insert_own" ON exam_results
  FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Policy: Students can update their own incomplete results
CREATE POLICY "results_student_update_own" ON exam_results
  FOR UPDATE
  USING (
    student_id = auth.uid() AND
    completed_at IS NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Policy: Instructors can see results for their exams
CREATE POLICY "results_instructor_select" ON exam_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exams e
      JOIN users u ON u.id = auth.uid()
      WHERE e.id = exam_results.exam_id 
      AND e.instructor_id = auth.uid()
      AND u.role IN ('instructor', 'admin')
    )
  );

-- Policy: Admins can see all results
CREATE POLICY "results_admin_all" ON exam_results
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Test queries
-- Test 1: Student sees only own results
-- SELECT * FROM exam_results WHERE student_id = auth.uid(); -- Should return student's results

-- Test 2: Instructor sees results for their exams
-- SELECT er.* FROM exam_results er 
-- JOIN exams e ON e.id = er.exam_id 
-- WHERE e.instructor_id = auth.uid(); -- Should return results for instructor's exams

-- Test 3: Student cannot see other students' results
-- SELECT * FROM exam_results WHERE student_id != auth.uid(); -- Should return empty for students