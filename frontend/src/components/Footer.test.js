import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders footer copyright text', () => {
    render(<Footer />);

    expect(
      screen.getByText('© 2026 KDU Student Management System - Department of Software Engineering')
    ).toBeInTheDocument();
  });
});
