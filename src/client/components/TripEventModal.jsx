import { useState, useEffect } from 'react';
import { Gauge, MapPin, MessageSquare } from 'lucide-react';
import Modal from './Modal';
import BigButton from './BigButton';
import api from '../api/index';
import { useAppStore } from '../store/useAppStore';

const eventLabels = {
  transit_start:    '🟢 Початок транзиту',
  transit_end:      '🔴 Кінець транзиту',
  border_crossing:  '🛂 Перетин кордону',
  loading_start:    '📦 Початок завантаження',
  loading_end:      '✅ Кінець завантаження',
  unloading_start:  '📤 Початок вигрузки',
  unloading_end:    '🏁 Кінець вигрузки',
};

export default function TripEventModal({ isOpen, onClose, eventType, lastOdometer = '', onSaved }) {
  const activeShift = useAppStore((s) => s.activeShift);
  const [odometer, setOdometer] = useState(String(lastOdometer));
  const [border_name, setBorderName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset fields when modal opens with new eventType
  useEffect(() => {
    if (isOpen) {
      setOdometer(String(lastOdometer));
      setBorderName('');
      setComment('');
      setError('');
    }
  }, [isOpen, lastOdometer]);

  const isBorder = eventType === 'border_crossing';

  const handleSave = async () => {
    setError('');
    if (!odometer) return setError('Введіть показники одометра');
    if (isBorder && !border_name.trim()) return setError('Введіть назву КПП / кордону');

    setLoading(true);
    try {
      await api.post('/trip/event', {
        shift_id: activeShift.id,
        event_type: eventType,
        border_name: isBorder ? border_name.trim() : undefined,
        odometer: parseInt(odometer),
        comment: comment.trim() || undefined,
        timestamp: new Date().toISOString(),
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка збереження');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={eventLabels[eventType] || 'Подія'}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Border name — conditional */}
        {isBorder && (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              <MapPin size={14} className="inline mr-1" />
              Назва КПП / Кордону *
            </label>
            <input
              type="text"
              value={border_name}
              onChange={(e) => setBorderName(e.target.value)}
              placeholder="наприклад: Краківець, Медика"
              autoFocus
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-50 text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Odometer */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <Gauge size={14} className="inline mr-1" />
            Одометр (км) *
          </label>
          <input
            type="number"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder="Поточний показник"
            autoFocus={!isBorder}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-50 text-lg font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <MessageSquare size={14} className="inline mr-1" />
            Коментар
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Транзит пустим, завантаження палет…"
            rows={2}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-50 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <BigButton color="slate" onClick={onClose} fullWidth={false} className="flex-1">
            Скасувати
          </BigButton>
          <BigButton
            color="green"
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
