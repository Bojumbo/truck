import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock } from 'lucide-react';
import api from '../api/index';
import { useAppStore } from '../store/useAppStore';
import BigButton from '../components/BigButton';
import TripEventModal from '../components/TripEventModal';

const eventGroups = [
  {
    title: 'Транзит',
    events: [
      { type: 'transit_start',   label: 'РОЗПОЧАТИ ТРАНЗИТ',     color: 'green',  emoji: '🟢' },
      { type: 'transit_end',     label: 'ЗАКІНЧИТИ ТРАНЗИТ',      color: 'red',    emoji: '🔴' },
    ],
  },
  {
    title: 'Кордон',
    events: [
      { type: 'border_crossing', label: 'ПУНКТ ПРОПУСКУ / КОРДОН', color: 'amber',  emoji: '🛂' },
    ],
  },
  {
    title: 'Завантаження',
    events: [
      { type: 'loading_start',   label: 'РОЗПОЧАТИ ЗАВАНТАЖЕННЯ', color: 'blue',   emoji: '📦' },
      { type: 'loading_end',     label: 'ЗАКІНЧИТИ ЗАВАНТАЖЕННЯ',  color: 'purple', emoji: '✅' },
    ],
  },
  {
    title: 'Вигрузка',
    events: [
      { type: 'unloading_start', label: 'РОЗПОЧАТИ ВИГРУЗКУ',      color: 'blue',   emoji: '📤' },
      { type: 'unloading_end',   label: 'ЗАКІНЧИТИ ВИГРУЗКУ',       color: 'red',    emoji: '🏁' },
    ],
  },
];

const eventTypeLabels = {
  transit_start:    '🟢 Початок транзиту',
  transit_end:      '🔴 Кінець транзиту',
  border_crossing:  '🛂 Перетин кордону',
  loading_start:    '📦 Початок завантаження',
  loading_end:      '✅ Кінець завантаження',
  unloading_start:  '📤 Початок вигрузки',
  unloading_end:    '🏁 Кінець вигрузки',
};

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

export default function DrivingPage() {
  const navigate = useNavigate();
  const activeShift = useAppStore((s) => s.activeShift);

  const [modalEvent, setModalEvent] = useState(null);
  const [tripLogs, setTripLogs] = useState([]);
  const [lastOdometer, setLastOdometer] = useState(activeShift?.odometer_start || '');

  const fetchLogs = useCallback(async () => {
    if (!activeShift?.id) return;
    try {
      const res = await api.get(`/trip/${activeShift.id}`);
      const logs = res.data || [];
      setTripLogs(logs.slice().reverse()); // newest first
      if (logs.length > 0) setLastOdometer(logs[logs.length - 1].odometer);
    } catch (err) {
      console.warn('fetchLogs error:', err.message);
    }
  }, [activeShift?.id]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSaved = async () => {
    setModalEvent(null);
    await fetchLogs();
  };

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-app-bg px-5 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-slate-50">🛣 Їзда</h1>
        </div>
      </div>

      {/* Event buttons */}
      <div className="px-5 flex-1 max-w-lg mx-auto w-full space-y-5">
        {eventGroups.map((group) => (
          <div key={group.title}>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-2">
              {group.title}
            </p>
            <div className="space-y-2">
              {group.events.map((ev) => (
                <BigButton
                  key={ev.type}
                  color={ev.color}
                  onClick={() => setModalEvent(ev.type)}
                >
                  {ev.emoji} {ev.label}
                </BigButton>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent trip logs */}
      {tripLogs.length > 0 && (
        <div className="px-5 mt-6 mb-8 max-w-lg mx-auto w-full">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Останні події
          </p>
          <div className="space-y-2">
            {tripLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="card px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 font-semibold text-sm">
                    {eventTypeLabels[log.event_type] || log.event_type}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-slate-500 text-xs">
                      <Clock size={10} />
                      {formatTime(log.timestamp)}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 text-xs">
                      <MapPin size={10} />
                      {log.odometer?.toLocaleString()} км
                    </span>
                    {log.border_name && (
                      <span className="text-amber-400 text-xs font-medium">
                        🛂 {log.border_name}
                      </span>
                    )}
                  </div>
                  {log.comment && (
                    <p className="text-slate-500 text-xs mt-1 truncate">{log.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Modal */}
      {modalEvent && (
        <TripEventModal
          isOpen={!!modalEvent}
          onClose={() => setModalEvent(null)}
          eventType={modalEvent}
          lastOdometer={lastOdometer}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
