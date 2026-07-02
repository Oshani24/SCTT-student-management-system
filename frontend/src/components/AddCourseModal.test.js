import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCourseModal from './AddCourseModal';
import api from '../utils/api';

jest.mock('../utils/api', () => ({
  post: jest.fn(),
  put: jest.fn(),
}));

describe('AddCourseModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AddCourseModal isOpen={false} onClose={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders add form when open in add mode', () => {
    render(<AddCourseModal isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByText('Add New Course')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., CS101')).toBeInTheDocument();
  });

  it('renders edit form with existing course data', () => {
    const course = { id: 1, code: 'CS101', name: 'Intro to CS', credits: 3 };
    render(
      <AddCourseModal isOpen={true} onClose={jest.fn()} mode="edit" courseData={course} />
    );

    expect(screen.getByText('Edit Course')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CS101')).toBeInTheDocument();
  });

  it('shows validation error when fields are empty', async () => {
    render(<AddCourseModal isOpen={true} onClose={jest.fn()} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Create Course' }).closest('form'));

    expect(
      await screen.findByText('Course code, name, and credits are required.')
    ).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('submits new course and calls onClose on success', async () => {
    const onClose = jest.fn();
    api.post.mockResolvedValue({ data: {} });

    render(<AddCourseModal isOpen={true} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('e.g., CS101'), {
      target: { value: 'CS201' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g., Introduction to Programming'), {
      target: { value: 'Data Structures' },
    });
    fireEvent.change(screen.getByPlaceholderText('3'), {
      target: { value: '3' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Course' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/courses', {
        code: 'CS201',
        name: 'Data Structures',
        credits: 3,
      });
    });
    expect(onClose).toHaveBeenCalledWith(true);
  });
});
