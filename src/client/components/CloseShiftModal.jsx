import { useState } from 'react';
import { Gauge, Clock } from 'lucide-react';
import Modal from './Modal';
import BigButton from './BigButton';
import api from '../api/index';
import { useAppStore } from '../store/useAppStore';

function toLocalDatetimeValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CloseShiftModal({ isOpen, onClose }) {
  const activeShift = useAppStore((s) => s.activeShift);
  const clearShift = useAppStore((s) => s.clearShift);

  const [odometer_end, setOdometerEnd] = useState('');
  const [card_removed_at, setCardRemovedAt] = useState(toLocalDatetimeValue());
  const [ref_hours_end, setRefHoursEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRef = activeShift?.trailer_type === 'ref';

  const handleClose = async () => {
    setError('');
    if (!odometer_end) return setError('Введіть показники одометра');
    const odomEnd = parseInt(odometer_end);
    if (odomEnd < activeShift?.odometer_start) {
      return setError('Одометр не може бути менший за початковий');
    }

    setLoading(true);
    try {
      await api.post('/shifts/close', {
        shift_id: activeShift.id,
        odometer_end: odomEnd,
        card_removed_at,
        ref_hours_end: isRef && ref_hours_end ? parseFloat(ref_hours_end) : undefined,
      });
      clearShift();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка закриття зміни');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Закрити зміну">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Odometer end */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <Gauge size={14} className="inline mr-1" />
            Одометр кінцевий (км) *
          </label>
          <input
            type="number"
            value={odometer_end}
            onChange={(e) => setOdometerEnd(e.target.value)}
            placeholder={`Більше ${activeShift?.odometer_start || 0}`}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-50 text-lg font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Card removed at */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <Clock size={14} className="inline mr-1" />
            Час вилучення карти
          </label>
          <input
            type="datetime-local"
            value={card_removed_at}
            onChange={(e) => setCardRemovedAt(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Ref hours (conditional) */}
        {isRef && (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Мотогодини рефрижератора (кінцеві)
            </label>
            <input
              type="number"
              step="0.1"
              value={ref_hours_end}
              onChange={(e) => setRefHoursEnd(e.target.value)}
              placeholder={`Більше ${activeShift?.ref_hours_start || 0}`}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-50 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Summary */}
        {odometer_end && activeShift?.odometer_start && (
          <div className="bg-slate-700/50 rounded-xl p-3 text-sm text-slate-300">
            Пробіг зміни: <span className="font-bold text-white font-mono">
              {parseInt(odometer_end) - activeShift.odometer_start} км
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <BigButton color="slate" onClick={onClose} fullWidth={false} className="flex-1">
            Скасувати
          </BigButton>
          <BigButton
            color="red"
            onClick={handleClose}
            disabled={loading}
            fullWidth={false}
            className="flex-1"
          >
            {loading ? 'Закриваємо...' : 'Закрити зміну'}
          </BigButton>
        </div>
      </div>
    </Modal>
  );
}
