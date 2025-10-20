# Education Management Dashboard

A comprehensive real-time education management system built with Next.js 15, Supabase, and TypeScript.

## Features

✅ **Real-time Student Management** - Add, edit, delete students with duplicate phone detection
✅ **Exam Management** - Create and manage exams with scoring
✅ **Performance Tracking** - Record and track student exam results with color-coded performance
✅ **Real-time Notifications** - Live updates across all connected clients
✅ **Duplicate Detection** - Automatic phone number validation
✅ **Dashboard Analytics** - Key metrics and statistics
✅ **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Real-time**: Supabase Realtime

## Database Schema

### Students Table

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Exams Table

```sql
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Student Exams Table

```sql
CREATE TABLE student_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  score NUMERIC(5,2),
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (student_id, exam_id)
);
```

## Setup Instructions

### 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `sql/setup.sql`
4. This will create all tables, enable RLS, and set up realtime subscriptions

### 2. Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install react-hot-toast --legacy-peer-deps
```

### 4. Run the Application

```bash
npm run dev
```

## Key Features

### 🔹 Student Management

- **Add Students**: Form validation with duplicate phone detection
- **Edit Students**: Update student information
- **Delete Students**: Confirmation dialog with cascade delete
- **Search**: Real-time search by name, phone, or academic year

### 🔹 Exam Management

- **Create Exams**: Add exams with title and total score
- **Edit Exams**: Update exam details
- **Delete Exams**: Remove exams with confirmation

### 🔹 Performance Tracking

- **Record Results**: Link students to exams with scores
- **Color Coding**:
  - 🟢 Green: 80%+ (Excellent)
  - 🟡 Yellow: 60-79% (Good)
  - 🔴 Red: <60% (Needs Improvement)
- **Percentage Calculation**: Automatic score percentage calculation

### 🔹 Real-time Features

- **Live Updates**: Changes appear instantly across all sessions
- **Toast Notifications**:
  - ✅ Success: New additions
  - ℹ️ Info: Updates
  - ❌ Error: Deletions
- **Duplicate Alerts**: Immediate warning for duplicate phone numbers

### 🔹 Dashboard Analytics

- **Total Students**: Count of registered students
- **Total Exams**: Number of created exams
- **Average Score**: Overall performance metric
- **Top Performers**: Students with 80%+ scores

## Component Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── dashboard-stats.tsx
│   │   ├── student-performance.tsx
│   │   └── performance-form.tsx
│   ├── students/
│   │   ├── students-table.tsx
│   │   └── student-form.tsx
│   ├── exams/
│   │   ├── exams-table.tsx
│   │   └── exam-form.tsx
│   └── ui/
├── hooks/
│   ├── use-students.ts
│   ├── use-exams.ts
│   ├── use-student-exams.ts
│   └── use-realtime-notifications.ts
├── types/
│   ├── database.ts
│   └── entities.ts
└── app/
    └── dashboard/
        ├── dashboard-client.tsx
        └── education-dashboard.tsx
```

## Usage Examples

### Adding a Student

1. Navigate to Students tab
2. Click "Add Student"
3. Fill in name, phone, and academic year
4. System automatically checks for duplicate phone numbers
5. Real-time notification appears on success

### Recording Exam Results

1. Navigate to Performance tab
2. Click "Record Result"
3. Select student and exam
4. Enter score (validated against exam total)
5. Percentage automatically calculated and color-coded

### Real-time Updates

- Open multiple browser windows
- Add/edit/delete records in one window
- Watch changes appear instantly in other windows
- Toast notifications show what changed

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication Required**: All operations require valid session
- **Input Validation**: Client and server-side validation
- **Unique Constraints**: Prevents duplicate phone numbers and exam attempts

## Performance Optimizations

- **Efficient Queries**: Optimized database queries with proper indexing
- **Real-time Subscriptions**: Minimal data transfer with targeted updates
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: Graceful error handling with user feedback

## Troubleshooting

### Common Issues

1. **Real-time not working**: Check if realtime is enabled in Supabase
2. **Duplicate phone error**: Ensure unique constraint is properly set
3. **Authentication issues**: Verify environment variables
4. **Toast notifications not showing**: Check react-hot-toast installation

### Database Issues

If you encounter database issues, run:

```sql
-- Reset tables (WARNING: This will delete all data)
DROP TABLE IF EXISTS student_exams CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS exams CASCADE;

-- Then re-run the setup script
```

## Future Enhancements

- 📊 Advanced analytics and reporting
- 📧 Email notifications for exam results
- 📱 Mobile app version
- 🔐 Role-based access control (Admin/Teacher/Student)
- 📈 Performance trends and insights
- 📋 Bulk import/export functionality

## Support

For issues or questions, check:

1. Supabase documentation
2. Next.js documentation
3. Component source code comments
4. Database logs in Supabase dashboard
