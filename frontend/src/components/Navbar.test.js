import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Navbar from './Navbar';
import api from '../utils/api';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  NavLink: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock('../utils/api', () => ({
  post: jest.fn(),
}));

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('logs out successfully and redirects to home', async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    localStorage.setItem('token', 'abc');
    localStorage.setItem('admin', JSON.stringify({ username: 'admin' }));

    render(<Navbar />);
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/logout');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('admin')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('still clears session and redirects if logout API fails', async () => {
    api.post.mockRejectedValue(new Error('logout failed'));
    localStorage.setItem('token', 'abc');
    localStorage.setItem('admin', JSON.stringify({ username: 'admin' }));

    render(<Navbar />);
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/logout');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('admin')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
