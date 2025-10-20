import { renderHook, act } from '@testing-library/react';
import { useStudents } from '@/hooks/use-students';
import { createClient } from '@/lib/supabase/client';

// Mock Supabase client
jest.mock('@/lib/supabase/client');
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

// Create a comprehensive mock that handles all the chaining
const createMockSupabaseClient = () => {
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  };

  return {
    from: jest.fn(() => mockChain),
    auth: { getUser: jest.fn() },
  };
};

const mockSupabase = createMockSupabaseClient();
(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe('useStudents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch students successfully', async () => {
    const mockStudents = [
      {
        id: '1',
        name: 'John Doe',
        phone: '+1234567890',
        academic_year: 'الفرقة الأولي',
        created_at: '2024-01-01',
      },
      {
        id: '2',
        name: 'Jane Smith',
        phone: '+1234567891',
        academic_year: 'الفرقة الثانية',
        created_at: '2024-01-02',
      },
    ];

    // Mock the chain for this specific test
    const mockFrom = mockSupabase.from();
    mockFrom.order.mockResolvedValueOnce({ data: mockStudents, error: null });

    const { result } = renderHook(() => useStudents());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.students).toEqual(mockStudents);
    expect(result.current.loading).toBe(false);
  });

  it('should add student successfully', async () => {
    const newStudent = {
      name: 'New Student',
      phone: '+1234567892',
      academic_year: 'الفرقة الأولي',
    };
    const mockStudent = { id: '3', ...newStudent, created_at: '2024-01-03' };

    // Mock the chain for duplicate check (no duplicate)
    const mockFrom = mockSupabase.from();
    mockFrom.eq.mockResolvedValueOnce({ data: null, error: null });
    mockFrom.single.mockResolvedValueOnce({ data: mockStudent, error: null });

    const { result } = renderHook(() => useStudents());

    let addResult: boolean = false;
    await act(async () => {
      addResult = await result.current.addStudent(newStudent);
    });

    expect(addResult).toBe(true);
  });

  it('should prevent duplicate phone numbers', async () => {
    const newStudent = {
      name: 'New Student',
      phone: '+1234567890',
      academic_year: 'الفرقة الأولي',
    };

    // Mock the chain for duplicate check (duplicate found)
    const mockFrom = mockSupabase.from();
    mockFrom.eq.mockResolvedValueOnce({ data: [{ id: '1' }], error: null });

    const { result } = renderHook(() => useStudents());

    let addResult: boolean = false;
    await act(async () => {
      addResult = await result.current.addStudent(newStudent);
    });

    expect(addResult).toBe(false);
  });

  it('should update student successfully', async () => {
    const studentId = '1';
    const updates = {
      name: 'Updated Student',
      phone: '+1234567890',
      academic_year: 'الفرقة الثانية',
    };
    const mockUpdatedStudent = {
      id: studentId,
      ...updates,
      created_at: '2024-01-01',
    };

    // Mock the chain for duplicate check (no duplicate) and update
    const mockFrom = mockSupabase.from();
    mockFrom.neq.mockResolvedValueOnce({ data: null, error: null }); // No duplicate found
    mockFrom.single.mockResolvedValueOnce({
      data: mockUpdatedStudent,
      error: null,
    });

    const { result } = renderHook(() => useStudents());

    let updateResult: boolean = false;
    await act(async () => {
      updateResult = await result.current.updateStudent(studentId, updates);
    });

    expect(updateResult).toBe(true);
  });

  it('should delete student successfully', async () => {
    const studentId = '1';

    // Mock the chain for delete
    const mockFrom = mockSupabase.from();
    mockFrom.eq.mockResolvedValueOnce({ error: null });

    const { result } = renderHook(() => useStudents());

    let deleteResult: boolean = false;
    await act(async () => {
      deleteResult = await result.current.deleteStudent(studentId);
    });

    expect(deleteResult).toBe(true);
  });
});
