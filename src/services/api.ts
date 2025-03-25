// src/services/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
console.log('API URL:', API_URL);

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('Request being made to:', config.url);
    console.log('With method:', config.method);
    return config;
  },
  (error: any) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);


// Response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if error is 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear token
      Cookies.remove('token');
      
      // If we're in the browser, redirect to login page
      if (typeof window !== 'undefined') {
        // Set optional message to display on login page
        sessionStorage.setItem('authMessage', 'Your session has expired. Please log in again.');
        
        // Redirect to login
        //window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Define interfaces for the data structures
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}

interface AddressData {
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  squareFootage: number;
  notes?: string;
  isDefault?: boolean;
}

interface BookingData {
  serviceTypeId: string;
  addressId: string;
  date: string;
  timeSlot: string;
  squareFootage?: number | null;
  hasPets?: boolean;
  messiness?: number;
  supplies?: 'customer' | 'cleaner';
  frequency?: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  notes?: string;
  preferredDates?: string[];
  preferredTimeSlots?: string[];
  flexibleScheduling?: boolean;
  cleanerId?: string | null;
}

// Auth API
export const authAPI = {
  register: async (userData: UserData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
};

// Address API
export const addressAPI = {
  getUserAddresses: async () => {
    const response = await api.get('/addresses');
    return response.data;
  },
  createAddress: async (addressData: AddressData) => {
    const response = await api.post('/addresses', addressData);
    return response.data;
  },
  updateAddress: async (id: string, addressData: Partial<AddressData>) => {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data;
  },
  deleteAddress: async (id: string) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },
};

// Service API
export const serviceAPI = {
  getServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },
  getServiceById: async (id: string) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  // Make sure your backend has this endpoint available
  getServiceByCode: async (code: string) => {
    const response = await api.get(`/services/code/${code}`);
    return response.data;
  }
};

// Booking API
export const bookingAPI = {
  createBooking: async (bookingData: BookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  getUserBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
  getBookingById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  cancelBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
  rescheduleBooking: async (id: string, newDate: string, newTimeSlot: string) => {
    const response = await api.put(`/bookings/${id}/reschedule`, { date: newDate, timeSlot: newTimeSlot });
    return response.data;
  },
  getAvailableTimeSlots: async (date: string) => {
    const response = await api.get(`/bookings/slots/${date}`);
    return response.data;
  },
};

export default api;