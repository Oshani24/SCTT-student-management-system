import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';
import api from '../utils/api';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout API to record in audit log
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and navigate to home
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <img src={logo} alt="KDU Logo" className="logo" />
        <div className="navbar-title">
          <h1>KDU</h1>
          <p>Software Engineering</p>
        </div>
      </div>
      <ul>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-th-large"></i> Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/add-student" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-user-plus"></i> Add Student
          </NavLink>
        </li>

        <li>
          <NavLink to="/student-list" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-list"></i> Student List
          </NavLink>
        </li>

        <li>
          <NavLink to="/course-management" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-book"></i> Course Management
          </NavLink>
        </li>

        <li>
          <NavLink to="/audit-logs" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-file-alt"></i> Audit Logs
          </NavLink>
        </li>
      </ul>
      <div className="logout" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </div>
    </nav>
  );
};

export default Navbar;
