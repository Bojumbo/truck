import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — handle offline queuing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (offline)
    if (!error.response && error.config) {
      const store = useAppStore.getState();
      const cfg = error.config;

      // Only queue mutation requests (not GETs)
      if (cfg.method && cfg.method.toLowerCase() !== 'get') {
        store.queueOfflineAction({
          method: cfg.method,
          url: cfg.url,
          data: cfg.data ? JSON.parse(cfg.data) : undefined,
        });
        console.warn('📴 Offline: queued action', cfg.url);
        return Promise.resolve({ data: { queued: true }, status: 202 });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
