let requestHandler;
let responseErrorHandler;

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn((handler) => {
          requestHandler = handler;
        }),
      },
      response: {
        use: jest.fn((successHandler, errorHandler) => {
          responseErrorHandler = errorHandler;
        }),
      },
    },
  })),
}));

require('./api');

describe('api interceptor configuration', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    delete window.location;
    window.location = {
      ...originalLocation,
      assign: jest.fn(),
    };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('adds authorization header when token exists', () => {
    localStorage.setItem('token', 'jwt-token');
    const config = { headers: {} };

    const result = requestHandler(config);

    expect(result.headers.Authorization).toBe('Bearer jwt-token');
  });

  it('keeps request unchanged when token does not exist', () => {
    const config = { headers: {} };

    const result = requestHandler(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('clears auth data and redirects on protected-route 401 response', async () => {
    localStorage.setItem('token', 'jwt-token');
    localStorage.setItem('admin', JSON.stringify({ username: 'admin' }));
    const error = { response: { status: 401 }, config: { url: '/api/students' } };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('admin')).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith('/login');
  });

  it('does not clear auth data or redirect on login 401 response', async () => {
    localStorage.setItem('token', 'jwt-token');
    localStorage.setItem('admin', JSON.stringify({ username: 'admin' }));
    const error = { response: { status: 401 }, config: { url: '/api/auth/login' } };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(localStorage.getItem('token')).toBe('jwt-token');
    expect(localStorage.getItem('admin')).toBe(JSON.stringify({ username: 'admin' }));
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('does not clear auth data for non-401 responses', async () => {
    localStorage.setItem('token', 'jwt-token');
    localStorage.setItem('admin', JSON.stringify({ username: 'admin' }));
    const error = { response: { status: 500 } };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(localStorage.getItem('token')).toBe('jwt-token');
    expect(localStorage.getItem('admin')).toBe(JSON.stringify({ username: 'admin' }));
  });

  it('does not redirect on non-login 401 when already on login page', async () => {
    localStorage.setItem('token', 'jwt-token');
    localStorage.setItem('admin', JSON.stringify({ username: 'admin' }));

    window.location.pathname = '/login';
    const error = { response: { status: 401 }, config: { url: '/api/students' } };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(localStorage.getItem('token')).toBe('jwt-token');
    expect(localStorage.getItem('admin')).toBe(JSON.stringify({ username: 'admin' }));
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
