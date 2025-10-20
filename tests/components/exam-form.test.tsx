import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExamForm } from '@/components/exams/exam-form';
import { Exam } from '@/types/entities';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const defaultProps = {
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
};

describe('ExamForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form with empty fields when no exam provided', () => {
    render(<ExamForm {...defaultProps} />);

    expect(screen.getByLabelText(/exam title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total score/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add exam/i })
    ).toBeInTheDocument();
  });

  it('should render form with exam data when exam provided', () => {
    const exam: Exam = {
      id: '1',
      title: 'Math Exam',
      total_score: 100,
      created_at: '2024-01-01',
    };

    render(<ExamForm exam={exam} {...defaultProps} />);

    expect(screen.getByDisplayValue('Math Exam')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('should call onSubmit with form data when form is submitted', async () => {
    mockOnSubmit.mockResolvedValue(true);

    render(<ExamForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/exam title/i), {
      target: { value: 'Science Exam' },
    });
    fireEvent.change(screen.getByLabelText(/total score/i), {
      target: { value: '80' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add exam/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Science Exam',
        total_score: 80,
      });
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<ExamForm {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should disable submit button when form is invalid', () => {
    render(<ExamForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /add exam/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when form is valid', () => {
    render(<ExamForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/exam title/i), {
      target: { value: 'Test Exam' },
    });
    fireEvent.change(screen.getByLabelText(/total score/i), {
      target: { value: '100' },
    });

    const submitButton = screen.getByRole('button', { name: /add exam/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should show loading state when submitting', async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ExamForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/exam title/i), {
      target: { value: 'Test Exam' },
    });
    fireEvent.change(screen.getByLabelText(/total score/i), {
      target: { value: '100' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add exam/i }));

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('should handle form validation', () => {
    render(<ExamForm {...defaultProps} />);

    const titleInput = screen.getByLabelText(/exam title/i);
    const scoreInput = screen.getByLabelText(/total score/i);

    // Test required fields
    expect(titleInput).toBeRequired();
    expect(scoreInput).toBeRequired();

    // Test min values
    expect(scoreInput).toHaveAttribute('min', '1');
  });
});
