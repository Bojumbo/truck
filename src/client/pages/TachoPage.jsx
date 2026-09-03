import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hammer, BedDouble, Truck, Pencil, ChevronLeft, Clock } from 'lucide-react';
import api from '../api/index';
import { useAppStore } from '../store/useAppStore';
import BigButton from '../components/BigButton';
import EditTimeModal from '../components/EditTimeModal';

const modeConfig = {
  hammer:  { label: 'МОЛОТКИ',  icon: Hammer,    color: 'amber',  emoji: '🔨', desc: 'Інші роботи' },
  bed:     { label: 'ЛІЖЕЧКО',  icon: BedDouble,  color: 'blue',   emoji: '🛌', desc: 'Відпочинок' },
  driving: { label: 'ЇЗДУ',     icon: Truck,      color: 'green',  emoji: '🚛', desc: 'Керування' },
};

const modeColors = {
  hammer:  { bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/50' },
  bed:     { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/50'  },
  driving: { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/50' },
};

function formatTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

function formatMinutes(mins) {
  if (!mins) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}г ${m}хв` : `${m}хв`;
}

export default function TachoPage() {
  const navigate = useNavigate();
  const activeShift = useAppStore((s) => s.activeShift);
  const currentTacho = useAppStore((s) => s.currentTacho);
  const setCurrentTacho = useAppStore((s) => s.setCurrentTacho);

  const [recentLogs, setRecentLogs] = useState([]);
  const [editingLog, setEditingLog] = useState(null);
  const [loadingMode, setLoadingMode] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!activeShift?.id) return;
    try {
      const res = await api.get(`/tacho/current?shift_id=${activeShift.id}`);
      setCurrentTacho(res.data.current);
      setRecentLogs(res.data.recent || []);
    } catch (err) {
      console.warn('fetchLogs error:', err.message);
    }
  }, [activeShift?.id]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleToggle = async (mode) => {
    if (!activeShift?.id) return;
    setLoadingMode(mode);
    try {
      const res = await api.post('/tacho/toggle', { shift_id: activeShift.id, mode });
      setCurrentTacho(res.data.current);
      await fetchLogs();
    } catch (err) {
      console.warn('toggle error:', err.message);
    } finally {
      setLoadingMode(null);
    }
  };

  const handleEditUpdated = async () => {
    await fetchLogs();
    setShowEdit(false);
  };

  const currentMode = currentTacho?.mode;
  const currentColors = currentMode ? modeColors[currentMode] : null;

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-app-bg px-5 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-slate-50">⏱ Тахограф</h1>
        </div>

        {/* Current mode display */}
        {currentTacho && currentColors ? (
          <div className={`card ${currentColors.bg} border ${currentColors.border} p-4 rounded-2xl animate-fade-in`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{modeConfig[currentMode]?.emoji}</span>
              <div>
                <p className="text-sm text-slate-400 font-medium">Активний режим</p>
                <p className={`text-xl font-bold ${currentColors.text}`}>
                  {modeConfig[currentMode]?.desc}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-slate-400 text-xs">Початок</p>
                <p className="text-slate-200 font-mono font-bold text-lg">
                  {formatTime(currentTacho.start_time)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-4 rounded-2xl bg-slate-800/50 border-dashed">
            <p className="text-slate-500 text-center">Режим не обрано</p>
          </div>
        )}
      </div>

      {/* Mode buttons */}
      <div className="px-5 space-y-3 max-w-lg mx-auto w-full">
        {Object.entries(modeConfig).map(([mode, cfg]) => {
          const Icon = cfg.icon;
          const isActive = currentMode === mode;
          const isLoading = loadingMode === mode;
          return (
            <BigButton
              key={mode}
              color={cfg.color}
              icon={Icon}
              isActive={isActive}
              disabled={isLoading}
              onClick={() => handleToggle(mode)}
              size="lg"
            >
              {isLoading ? 'Перемикаємо...' : `РОЗПОЧАТИ ${cfg.label}`}
            </BigButton>
          );
        })}
      </div>

      {/* Recent tacho logs */}
      {recentLogs.length > 0 && (
        <div className="px-5 mt-6 flex-1 max-w-lg mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
              Останні записи
            </p>
          </div>
          <div className="space-y-2">
            {recentLogs.map((log, idx) => {
              const cfg = modeConfig[log.mode];
              const colors = modeColors[log.mode];
              const isFirst = idx === 0;
              return (
                <div
                  key={log.id}
                  className={`card px-4 py-3 flex items-center gap-3 ${isFirst ? `${colors?.bg} border ${colors?.border}` : ''}`}
                >
                  <span className="text-xl flex-shrink-0">{cfg?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isFirst ? colors?.text : 'text-slate-300'}`}>
                      {cfg?.desc}
                    </p>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                      <Clock size={10} />
                      <span>{formatTime(log.start_time)}</span>
                      {log.end_time && <span>→ {formatTime(log.end_time)}</span>}
                      {log.duration_minutes && (
                        <span className="text-slate-400">({formatMinutes(log.duration_minutes)})</span>
                      )}
                      {!log.end_time && (
                        <span className={`font-medium ${colors?.text}`}>● Активний</span>
                      )}
                    </div>
                  </div>
                  {/* Edit button on first entry */}
                  {isFirst && (
                    <button
                      onClick={() => { setEditingLog(log); setShowEdit(true); }}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition-colors flex-shrink-0"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="h-8" />

      <EditTimeModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        tachoLog={editingLog}
        onUpdated={handleEditUpdated}
      />
    </div>
  );
}
