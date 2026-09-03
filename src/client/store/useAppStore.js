import { create } from 'zustand';
import api from '../api/index';

const OFFLINE_QUEUE_KEY = 'tacho_offline_queue';

function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveQueue(queue) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export const useAppStore = create((set, get) => ({
  activeShift: null,
  currentTacho: null,
  loading: true,
  offlineQueue: loadQueue(),

  // ---- Fetch active shift from server ----
  fetchActiveShift: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/shifts/active');
      const shift = res.data;
      set({ activeShift: shift });

      if (shift) {
        // Fetch current tacho mode
        const tachoRes = await api.get(`/tacho/current?shift_id=${shift.id}`);
        set({ currentTacho: tachoRes.data.current });
      }
    } catch (err) {
      console.warn('fetchActiveShift: offline or error', err.message);
      // Try from localStorage cache
      const cached = localStorage.getItem('active_shift');
      if (cached) set({ activeShift: JSON.parse(cached) });
    } finally {
      set({ loading: false });
    }
  },

  setActiveShift: (shift) => {
    set({ activeShift: shift });
    if (shift) localStorage.setItem('active_shift', JSON.stringify(shift));
    else localStorage.removeItem('active_shift');
  },

  setCurrentTacho: (tacho) => set({ currentTacho: tacho }),

  clearShift: () => {
    set({ activeShift: null, currentTacho: null });
    localStorage.removeItem('active_shift');
  },

  // ---- Offline queue ----
  queueOfflineAction: (action) => {
    const queue = [...get().offlineQueue, { ...action, queued_at: new Date().toISOString() }];
    set({ offlineQueue: queue });
    saveQueue(queue);
  },

  syncOfflineQueue: async () => {
    const queue = get().offlineQueue;
    if (!queue.length || !navigator.onLine) return;

    console.log(`🔄 Syncing ${queue.length} offline actions...`);
    const failed = [];

    for (const action of queue) {
      try {
        await api.request({
          method: action.method,
          url: action.url,
          data: action.data,
        });
        console.log('✅ Synced:', action.url);
      } catch (err) {
        console.warn('❌ Sync failed:', action.url, err.message);
        failed.push(action);
      }
    }

    set({ offlineQueue: failed });
    saveQueue(failed);

    // Refresh shift state after sync
    if (failed.length < queue.length) {
      get().fetchActiveShift();
    }
  },
}));
