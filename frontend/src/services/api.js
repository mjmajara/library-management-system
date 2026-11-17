const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
    throw error;
  }
}

export const booksApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.genre) query.append('genre', params.genre);
    if (params.lowStock) query.append('lowStock', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/books${queryString}`);
  },
  getById: (id) => request(`/books/${id}`),
  create: (bookData) =>
    request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),
  update: (id, bookData) =>
    request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    }),
  delete: (id) =>
    request(`/books/${id}`, {
      method: 'DELETE',
    }),
};

export const transactionsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.bookId) query.append('bookId', params.bookId);
    if (params.userId) query.append('userId', params.userId);
    if (params.type) query.append('type', params.type);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/transactions${queryString}`);
  },
  create: (transactionData) =>
    request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    }),
  getStats: () => request('/transactions/stats'),
};

export const usersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/users${queryString}`);
  },
  getById: (id) => request(`/users/${id}`),
  create: (userData) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  update: (id, userData) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  delete: (id) =>
    request(`/users/${id}`, {
      method: 'DELETE',
    }),
  login: (credentials) =>
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

export const systemApi = {
  getHealth: () => request('/health'),
};
