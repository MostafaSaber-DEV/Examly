import { renderHook, act } from '@testing-library/react';
import { useExams } from '@/hooks/use-exams';
import { createClient } from '@/lib/supabase/client';

// Mock Supabase client
jest.mock('@/lib/supabase/client');
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn(() =>
        Promise.resolve({
          data: [],
          error: null,
        })
      ),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() =>
          Promise.resolve({
            data: null,
            error: null,
          })
        ),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: null,
              error: null,
            })
          ),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() =>
        Promise.resolve({
          error: null,
        })
      ),
    })),
  })),
  auth: {
    getUser: jest.fn(),
  },
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe('useExams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch exams successfully', async () => {
    const mockExams = [
      {
        id: '1',
        title: 'Math Exam',
        total_score: 100,
        created_at: '2024-01-01',
      },
      {
        id: '2',
        title: 'Science Exam',
        total_score: 80,
        created_at: '2024-01-02',
      },
    ];

    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockReturnValue({
        data: mockExams,
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    });

    const { result } = renderHook(() => useExams());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.exams).toEqual(mockExams);
    expect(result.current.loading).toBe(false);
  });

  it('should add exam successfully', async () => {
    const newExam = { title: 'New Exam', total_score: 100 };
    const mockExam = { id: '3', ...newExam, created_at: '2024-01-03' };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          data: mockExam,
          error: null,
        }),
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn(),
      insert: mockInsert,
      update: jest.fn(),
      delete: jest.fn(),
    });

    const { result } = renderHook(() => useExams());

    let addResult: boolean = false;
    await act(async () => {
      addResult = await result.current.addExam(newExam);
    });

    expect(addResult).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({
      title: newExam.title,
      total_score: newExam.total_score,
    });
  });

  it('should handle add exam error', async () => {
    const newExam = { title: 'New Exam', total_score: 100 };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          data: null,
          error: new Error('Database error'),
        }),
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn(),
      insert: mockInsert,
      update: jest.fn(),
      delete: jest.fn(),
    });

    const { result } = renderHook(() => useExams());

    let addResult: boolean = false;
    await act(async () => {
      addResult = await result.current.addExam(newExam);
    });

    expect(addResult).toBe(false);
  });

  it('should update exam successfully', async () => {
    const examId = '1';
    const updates = { title: 'Updated Exam', total_score: 90 };
    const mockUpdatedExam = {
      id: examId,
      ...updates,
      created_at: '2024-01-01',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            data: mockUpdatedExam,
            error: null,
          }),
        }),
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn(),
      insert: jest.fn(),
      update: mockUpdate,
      delete: jest.fn(),
    });

    const { result } = renderHook(() => useExams());

    let updateResult: boolean = false;
    await act(async () => {
      updateResult = await result.current.updateExam(examId, updates);
    });

    expect(updateResult).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      title: updates.title,
      total_score: updates.total_score,
    });
  });

  it('should delete exam successfully', async () => {
    const examId = '1';

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: mockDelete,
    });

    const { result } = renderHook(() => useExams());

    let deleteResult: boolean = false;
    await act(async () => {
      deleteResult = await result.current.deleteExam(examId);
    });

    expect(deleteResult).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
  });
});
