import axios from 'axios';
import MESSAGES from '../constant/message';

// Create an Axios instance with default configurations
const apiClient = axios.create({
  baseURL: MESSAGES.api.baseUrl, // Replace with your API base URL
  withCredentials: true, // Ensure cookies are included in requests
  headers: {
    'Content-Type': 'application/json',
  },
});



// Function to make GET requests
export const get = async (endpoint:any) => {
  try {
    const response = await apiClient.get(endpoint);
    return response.data; // Return the API response data
  } catch (error:any) {
    if (error.response && error.response.status === 401) {
      return { message: MESSAGES.error.unauthorized, status: 401 };
    }
    if (error.response && error.response.status === 429) {
      return { message: MESSAGES.error.tooManyRequest, status: 429 };
    }
    console.error('GET request failed:', error);
    throw error;
  }
};

// Function to make POST requests
export const post = async (endpoint:any, data:any) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data; // Return the API response data
  } catch (error:any) {
    if (error.response && error.response.status === 401) {
      return { message: MESSAGES.error.unauthorized, status: 401 };
    }
    if (error.response && error.response.status === 400) {
      return { message: error?.response?.data?.error, status: 400 };
    }
    if (error.response && error.response.status === 429) {
      return { message: MESSAGES.error.tooManyRequest, status: 429 };
    }
    throw error
  }
};

// Function to make PUT requests
export const put = async (endpoint:any, data:any) => {
  try {
    const response = await apiClient.put(endpoint, data);
    return response.data; // Return the API response data
  } catch (error:any) {
    if (error.response && error.response.status === 401) {
      return { message: MESSAGES.error.unauthorized, status: 401 };
    }    
    if (error.response && error.response.status === 429) {
      return { message: MESSAGES.error.tooManyRequest, status: 429 };
    }
    console.error('PUT request failed:', error);
    throw error;
  }
};

// Function to make DELETE requests
export const del = async (endpoint:any) => {
  try {
    const response = await apiClient.delete(endpoint);
    return response.data; // Return the API response data
  } catch (error:any) {
    if (error.response && error.response.status === 401) {
      return { message: MESSAGES.error.unauthorized, status: 401 };
    }
    console.error('DELETE request failed:', error);
    throw error;
  }
};

export const login = async (uan:any, password:any, mobile_number:any) => {  
  try {
    const response = await apiClient.post('auth/login', { uan, password, mobile_number });
    return response.data;
  } catch (error:any) {
    if (error.response && error.response.status === 400) {
      return { message: MESSAGES.error.invalidUanPassword, status: 400 };
    }
    
    console.error('Login failed:', error);
    // Re-throw for other error cases
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await apiClient.post('auth/logout');
    return response.data;
  } catch (error:any) {
    if (error.response && error.response.status === 401) {
      return { message: MESSAGES.error.logoutError, status: 401 };
    }
    console.error('logout failed:', error);
    // Re-throw for other error cases
    throw error;
  }
};

export const adminLogin = async (endpoint:any, data:any) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  }catch (error:any) {
    if (error.response && error.response.status === 400) {
      return { message: MESSAGES.error.invalidUanPassword, status: 400 };
    }
    console.error('Admin Login failed:', error);
    // Re-throw for other error cases
    throw error;
  }
};

// Function to make POST requests
export const downloadExcal = async (endpoint:any, data:any, config:any) => { 
  try {
    const response = await apiClient.post(endpoint, data, config);
    return response;
  } catch (error:any) {
    if (error.response && error.response.status === 401) {
      return { message: MESSAGES.error.unauthorized, status: 401 };
    }
    if (error.response && error.response.status === 400) {
      return { message: error?.response?.data?.error, status: 400 };
    }
    if (error.response && error.response.status === 429) {
      return { message: MESSAGES.error.tooManyRequest, status: 429 };
    }
    throw error
  }
};
