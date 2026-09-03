import { useState } from 'react';
import { Clock } from 'lucide-react';
import Modal from './Modal';
import BigButton from './BigButton';
import api from '../api/index';

function toLocalDatetimeValue(d) {
  if (!d) return '';
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export default function EditTimeModal({ isOpen, onClose, tachoLog, onUpdated }) {
  const [start_time, setStartTime] = useState(
    toLocalDatetimeValue(tachoLog?.start_time)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync when log changes
  if (tachoLog && toLocalDatetimeValue(tachoLog.start_time) !== '' && start_time === '') {
    setStartTime(toLocalDatetimeValue(tachoLog.start_time));
  }

  const handleSave = async () => {
    setError('');
    if (!start_time) return setError('Вкажіть час');
    if (!tachoLog?.id) return;

    // Don't allow future times
    if (new Date(start_time) > new Date()) {
      return setError('Час не може бути в майбутньому');
    }

    setLoading(true);
    try {
      const res = await api.patch(`/tacho/${tachoLog.id}`, { start_time });
      onUpdated?.(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка збереження');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редагувати час початку">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <Clock size={14} className="inline mr-1" />
            Час початку режиму
          </label>
          <input
            type="datetime-local"
            value={start_time}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-50 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <p className="text-slate-500 text-sm">
          ⚠️ Зміна часу автоматично перерахує тривалість попереднього запису.
        </p>

        <div className="flex gap-3 pt-2">
          <BigButton color="slate" onClick={onClose} fullWidth={false} className="flex-1">
            Скасувати
          </BigButton>
          <BigButton
            color="amber"
            onClick={handleSave}
            disabled={loading}
            fullWidth={false}
            className="flex-1"
          >
            {loading ? 'Зберігаємо...' : '✓ Зберегти'}
          </BigButton>
        </div>
      </div>
    </Modal>
  );
}
