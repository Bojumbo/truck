import { Truck, Clock, Hammer, BedDouble, Gauge } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useState, useEffect } from 'react';

const modeConfig = {
  hammer:  { label: 'Молотки',   icon: Hammer,    color: 'text-amber-400', bg: 'bg-amber-500/15', dot: 'bg-amber-400' },
  bed:     { label: 'Ліжечко',   icon: BedDouble,  color: 'text-blue-400',  bg: 'bg-blue-500/15',  dot: 'bg-blue-400' },
  driving: { label: 'Їзда',      icon: Truck,      color: 'text-green-400', bg: 'bg-green-500/15', dot: 'bg-green-400' },
};

function formatDuration(startTime) {
  if (!startTime) return '00:00';
  const diff = Math.floor((Date.now() - new Date(startTime)) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

export default function StatusBanner({ onlineStatus }) {
  const activeShift = useAppStore((s) => s.activeShift);
  const currentTacho = useAppStore((s) => s.currentTacho);
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!currentTacho?.start_time) return;
    const interval = setInterval(() => {
      setElapsed(formatDuration(currentTacho.start_time));
    }, 1000);
    setElapsed(formatDuration(currentTacho.start_time));
    return () => clearInterval(interval);
  }, [currentTacho?.start_time]);

  if (!activeShift) return null;

  const mode = currentTacho ? modeConfig[currentTacho.mode] : null;
  const ModeIcon = mode?.icon;

  return (
    <div className="card p-4 mb-4">
      <div className="flex items-start justify-between gap-3">
        {/* Left: truck info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
            <Truck size={20} className="text-slate-300" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg text-slate-50 truncate">{activeShift.truck_number}</p>
            {activeShift.trailer_number && (
              <p className="text-slate-400 text-sm truncate">Причіп: {activeShift.trailer_number}</p>
            )}
          </div>
        </div>

        {/* Right: online indicator */}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
          onlineStatus === false
            ? 'bg-red-500/20 text-red-400'
            : 'bg-green-500/20 text-green-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            onlineStatus === false ? 'bg-red-400' : 'bg-green-400'
          }`} />
          {onlineStatus === false ? 'Офлайн' : 'Онлайн'}
        </div>
      </div>

      {/* Shift start time */}
      <div className="mt-3 flex items-center gap-2 text-slate-400 text-sm">
        <Clock size={14} />
        <span>Початок зміни: {formatDateTime(activeShift.card_inserted_at)}</span>
      </div>

      {/* Current tacho mode */}
      {mode && (
        <div className={`mt-3 flex items-center gap-3 rounded-xl px-4 py-2.5 ${mode.bg}`}>
          <span className={`mode-dot animate-pulse-glow ${mode.dot}`} />
          <ModeIcon size={18} className={mode.color} />
          <span className={`font-semibold ${mode.color}`}>{mode.label}</span>
          <span className="ml-auto font-mono text-sm font-bold text-slate-300">{elapsed}</span>
        </div>
      )}

      {!mode && (
        <div className="mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5 bg-slate-700/50">
          <Gauge size={16} className="text-slate-400" />
          <span className="text-slate-400 text-sm">Режим не обрано</span>
        </div>
      )}
    </div>
  );
}
