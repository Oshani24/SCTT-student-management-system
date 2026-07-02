import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminProfileModal from './AdminProfileModal';

describe('AdminProfileModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<AdminProfileModal isOpen={false} onClose={jest.fn()} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders admin details from localStorage when open', () => {
    localStorage.setItem(
      'admin',
      JSON.stringify({
        full_name: 'Jane Doe',
        username: 'jane',
        email: 'jane@example.com',
        last_login: '2026-03-15T10:30:00Z',
      })
    );

    render(<AdminProfileModal isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByText('Admin Profile')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.queryByText('Never')).not.toBeInTheDocument();
  });

  it('shows Never for missing last login', () => {
    localStorage.setItem(
      'admin',
      JSON.stringify({
        full_name: 'Jane Doe',
      })
    );

    render(<AdminProfileModal isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = jest.fn();

    const { container } = render(<AdminProfileModal isOpen={true} onClose={onClose} />);
    fireEvent.click(container.querySelector('.modal-overlay'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
