import React, { useState, useRef, useEffect } from 'react';
import './AddStudent.css';
import { FaTimes } from 'react-icons/fa';
import api from '../utils/api';

const AddStudent = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const searchRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    nic: '',
    degreeProgram: '',
    year: '',
    semester: ''
  });

  // Fetch all courses from course service
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/api/courses');
        setAllCourses(res.data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleReset = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '', nic: '', degreeProgram: '', year: '', semester: '' });
    setEnrolledCourses([]);
    setSearchQuery('');
    setShowSearchResults(false);
    setSuccess('');
    setError('');
    setFieldErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formData.email.trim()) errors.email = 'Email is required.';
    if (!formData.phone.trim()) errors.phone = 'Phone is required.';
    if (!formData.address.trim()) errors.address = 'Address is required.';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
    if (!formData.nic.trim()) errors.nic = 'NIC number is required.';
    if (!formData.degreeProgram) errors.degreeProgram = 'Degree program is required.';
    if (!formData.year) errors.year = 'Academic year is required.';
    if (!formData.semester) errors.semester = 'Semester is required.';

    return errors;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const handleAddCourse = (course) => {
    const isAlreadyEnrolled = enrolledCourses.some(c => c.id === course.id);
    if (!isAlreadyEnrolled) {
      setEnrolledCourses([...enrolledCourses, course]);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleDeleteCourse = (courseId) => {
    setEnrolledCourses(enrolledCourses.filter(c => c.id !== courseId));
  };

  const getFilteredCourses = () => {
    if (!searchQuery) return [];
    const enrolledIds = enrolledCourses.map(c => c.id);
    return allCourses
      .filter(course => !enrolledIds.includes(course.id))
      .filter(course =>
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const filteredCourses = getFilteredCourses();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // 1. Register student
      const studentRes = await api.post('/api/students', {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        nic: formData.nic.trim(),
        date_of_birth: formData.dateOfBirth || null,
        degree_program: formData.degreeProgram.trim(),
        academic_year: formData.year.trim(),
        semester: formData.semester.trim(),
      });

      const studentNumber = studentRes.data.student_number;

      // 2. Enroll in selected courses
      for (const course of enrolledCourses) {
        try {
          await api.post('/api/enrollments', {
            student_number: studentNumber,
            course_id: course.id,
            course_code: course.code,
            course_name: course.name,
            credits: course.credits || 3,
            academic_year: formData.year,
            semester: formData.semester,
          });
        } catch (enrollErr) {
          console.warn('Enrollment error for course:', course.code, enrollErr.message);
        }
      }

      setSuccess(`Student registered successfully! Student Number: ${studentNumber}`);
      handleReset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-student-container">
      <div className="add-student-header">
        <h2>Add New Student</h2>
        <p>Fill in the student information below</p>
      </div>

      {success && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter first name" className={fieldErrors.firstName ? 'input-error' : ''} required />
              {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter last name" className={fieldErrors.lastName ? 'input-error' : ''} required />
              {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="student@kdu.ac.lk" className={fieldErrors.email ? 'input-error' : ''} required />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" className={fieldErrors.phone ? 'input-error' : ''} required />
              {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Address *</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter full address" className={fieldErrors.address ? 'input-error' : ''} required />
              {fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date Of Birth *</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className={fieldErrors.dateOfBirth ? 'input-error' : ''} required />
              {fieldErrors.dateOfBirth && <span className="field-error">{fieldErrors.dateOfBirth}</span>}
            </div>
            <div className="form-group">
              <label>NIC Number *</label>
              <input type="text" name="nic" value={formData.nic} onChange={handleInputChange} placeholder="e.g., 200352401278" className={fieldErrors.nic ? 'input-error' : ''} required />
              {fieldErrors.nic && <span className="field-error">{fieldErrors.nic}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Academic Information</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Degree Program *</label>
              <select name="degreeProgram" value={formData.degreeProgram} onChange={handleInputChange} className={`placeholder-select ${fieldErrors.degreeProgram ? 'input-error' : ''}`} required>
                <option value="" disabled>Select degree program</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Information System">Information System</option>
              </select>
              {fieldErrors.degreeProgram && <span className="field-error">{fieldErrors.degreeProgram}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Year *</label>
              <select name="year" value={formData.year} onChange={handleInputChange} className={`placeholder-select ${fieldErrors.year ? 'input-error' : ''}`} required>
                <option value="" disabled>Select academic year</option>
                <option value="Year 1">Year 1 (1st Year)</option>
                <option value="Year 2">Year 2 (2nd Year)</option>
                <option value="Year 3">Year 3 (3rd Year)</option>
                <option value="Year 4">Year 4 (4th Year)</option>
              </select>
              {fieldErrors.year && <span className="field-error">{fieldErrors.year}</span>}
            </div>
            <div className="form-group">
              <label>Semester *</label>
              <select name="semester" value={formData.semester} onChange={handleInputChange} className={`placeholder-select ${fieldErrors.semester ? 'input-error' : ''}`} required>
                <option value="" disabled>Select semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={`Semester ${n}`}>Semester {n}</option>
                ))}
              </select>
              {fieldErrors.semester && <span className="field-error">{fieldErrors.semester}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Enrolled Courses</label>
              <div className="course-search-container" ref={searchRef}>
                <input
                  type="text"
                  className="course-search-input"
                  placeholder="Search courses by code or name..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                />
                {showSearchResults && (
                  <div className="search-results-dropdown">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map(course => (
                        <div key={course.id} className="search-result-item" onClick={() => handleAddCourse(course)}>
                          <div className="search-result-info">
                            <p className="course-code">{course.code}</p>
                            <p className="course-name">{course.name}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">
                        {searchQuery ? 'No courses found' : 'Start typing to search courses'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {enrolledCourses.length > 0 && (
                <div className="selected-courses-list">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="selected-course-item">
                      <div className="selected-course-info">
                        <span className="selected-course-code">{course.code}</span>
                        <span className="selected-course-name">{course.name}</span>
                      </div>
                      <button type="button" className="delete-selected-course-btn" onClick={() => handleDeleteCourse(course.id)} title="Remove course">
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
