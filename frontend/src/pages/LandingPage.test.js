import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

describe('LandingPage', () => {
  it('renders university name and system title', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText('General Sir John Kotelawala Defence University')
    ).toBeInTheDocument();
    expect(screen.getByText('Student Management System')).toBeInTheDocument();
    expect(screen.getByText('Registration Module')).toBeInTheDocument();
  });

  it('renders the Administrator Login link pointing to /login', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const loginLink = screen.getByRole('link', { name: 'Administrator Login' });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('renders footer copyright text', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('© 2026 KDU. All rights reserved.')).toBeInTheDocument();
  });
});
