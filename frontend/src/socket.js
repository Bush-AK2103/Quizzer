import { io } from 'socket.io-client';

// Use an environment variable for the backend URL.
// This is crucial for production deployments, as localhost will not work.
// For development, it will fall back to localhost if the variable is not set.
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Ensure a backend URL is available.
if (!backendUrl) {
  console.warn('VITE_BACKEND_URL is not set. Using localhost for development.');
}

const socket = io(backendUrl || 'http://localhost:3001');

export default socket;
