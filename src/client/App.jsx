import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import ShiftStartPage from './pages/ShiftStartPage';
import DashboardPage from './pages/DashboardPage';
import TachoPage from './pages/TachoPage';
import DrivingPage from './pages/DrivingPage';
import ExpensesPage from './pages/ExpensesPage';

function RequireShift({ children }) {
  const activeShift = useAppStore((s) => s.activeShift);
  const loading = useAppStore((s) => s.loading);
  if (loading) return (
    <div className="flex items-center justify-center min-h-dvh bg-app-bg">
      <div className="text-center">
        <div className="text-4xl mb-4">🚛</div>
        <p className="text-app-subtext text-lg">Завантаження...</p>
      </div>
    </div>
  );
  if (!activeShift) return <Navigate to="/shift/start" replace />;
  return children;
}

function RedirectIfShiftActive({ children }) {
  const activeShift = useAppStore((s) => s.activeShift);
  const loading = useAppStore((s) => s.loading);
  if (loading) return null;
  if (activeShift) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const fetchActiveShift = useAppStore((s) => s.fetchActiveShift);
  const syncOfflineQueue = useAppStore((s) => s.syncOfflineQueue);

  useEffect(() => {
    fetchActiveShift();

    // Sync offline queue on app load and on network reconnect
    syncOfflineQueue();
    const handleOnline = () => syncOfflineQueue();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/shift/start"
          element={
            <RedirectIfShiftActive>
              <ShiftStartPage />
            </RedirectIfShiftActive>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireShift>
              <DashboardPage />
            </RequireShift>
          }
        />
        <Route
          path="/tacho"
          element={
            <RequireShift>
              <TachoPage />
            </RequireShift>
          }
        />
        <Route
          path="/driving"
          element={
            <RequireShift>
              <DrivingPage />
            </RequireShift>
          }
        />
        <Route
          path="/expenses"
          element={
            <RequireShift>
              <ExpensesPage />
            </RequireShift>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
