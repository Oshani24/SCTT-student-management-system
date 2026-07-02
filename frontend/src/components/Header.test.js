import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Header from './Header';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('./AdminProfileModal', () => {
  return function MockAdminProfileModal({ isOpen, onClose }) {
    return isOpen ? (
      <div>
        <span>Mock Profile Modal</span>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null;
  };
});

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('shows default admin name when not available', () => {
    render(<Header />);

    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('submits trimmed search term and clears input', () => {
    render(<Header />);

    const input = screen.getByPlaceholderText('Search by Student ID or Name...');
    fireEvent.change(input, { target: { value: '  ST001  ' } });
    fireEvent.submit(input.closest('form'));

    expect(mockNavigate).toHaveBeenCalledWith('/student-list', {
      state: { searchTerm: 'ST001' },
    });
    expect(input).toHaveValue('');
  });

  it('does not navigate when search term is empty', () => {
    render(<Header />);

    const input = screen.getByPlaceholderText('Search by Student ID or Name...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form'));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('opens profile modal when admin profile is clicked', () => {
    localStorage.setItem('admin', JSON.stringify({ full_name: 'Jane Admin' }));

    render(<Header />);

    fireEvent.click(screen.getByText('Jane Admin'));

    expect(screen.getByText('Mock Profile Modal')).toBeInTheDocument();
  });
});
