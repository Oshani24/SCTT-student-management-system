import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import api from '../utils/api';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../utils/api', () => ({
  post: jest.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('shows validation error when username or password is missing', async () => {
    render(<LoginPage />);

    const form = document.querySelector('form');
    fireEvent.submit(form);

    expect(await screen.findByText('Please enter both username and password.')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('logs in successfully and navigates to dashboard', async () => {
    api.post.mockResolvedValue({
      data: {
        token: 'abc123',
        admin: { username: 'admin' },
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter your username'), {
      target: { value: 'admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password1' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'admin',
        password: 'password1',
      });
    });

    expect(localStorage.getItem('token')).toBe('abc123');
    expect(localStorage.getItem('admin')).toBe(JSON.stringify({ username: 'admin' }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows backend error message when login fails', async () => {
    api.post.mockRejectedValue({
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter your username'), {
      target: { value: 'admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrong-password' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('toggles password visibility when icon is clicked', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(document.querySelector('.password-icon'));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
