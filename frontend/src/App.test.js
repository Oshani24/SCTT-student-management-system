import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/Navbar', () => () => <div>Mock Navbar</div>);
jest.mock('./components/Header', () => () => <div>Mock Header</div>);
jest.mock('./components/Footer', () => () => <div>Mock Footer</div>);

jest.mock('./pages/Dashboard', () => () => <div>Mock Dashboard</div>);
jest.mock('./pages/AddStudent', () => () => <div>Mock AddStudent</div>);
jest.mock('./pages/StudentList', () => () => <div>Mock StudentList</div>);
jest.mock('./pages/StudentDetails', () => () => <div>Mock StudentDetails</div>);
jest.mock('./pages/LandingPage', () => () => <div>Mock LandingPage</div>);
jest.mock('./pages/LoginPage', () => () => <div>Mock LoginPage</div>);
jest.mock('./pages/CourseManagement', () => () => <div>Mock CourseManagement</div>);
jest.mock('./pages/AuditLogs', () => () => <div>Mock AuditLogs</div>);

describe('App routing', () => {
  it('renders landing page on root route', () => {
    window.history.pushState({}, 'Landing', '/');

    render(<App />);

    expect(screen.getByText('Mock LandingPage')).toBeInTheDocument();
    expect(screen.queryByText('Mock Navbar')).not.toBeInTheDocument();
  });

  it('renders admin layout and dashboard on dashboard route', () => {
    window.history.pushState({}, 'Dashboard', '/dashboard');

    render(<App />);

    expect(screen.getByText('Mock Navbar')).toBeInTheDocument();
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(screen.getByText('Mock Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
  });
});
