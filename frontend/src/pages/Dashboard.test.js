import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import api from '../utils/api';

jest.mock('../utils/api', () => ({
  get: jest.fn(),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading placeholders initially', () => {
    api.get.mockReturnValue(new Promise(() => {})); // never resolves

    render(<Dashboard />);

    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });

  it('renders stats after data loads', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('students')) {
        return Promise.resolve({ data: { total: 42, by_degree: [] } });
      }
      return Promise.resolve({ data: { total: 10 } });
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders degree program labels', async () => {
    api.get.mockResolvedValue({ data: { total: 0, by_degree: [] } });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineering')).toBeInTheDocument();
    });
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Information Technology')).toBeInTheDocument();
    expect(screen.getByText('Information System')).toBeInTheDocument();
  });
});
