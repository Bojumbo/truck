import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Gauge, Clock, Thermometer, ChevronRight } from 'lucide-react';
import api from '../api/index';
import { useAppStore } from '../store/useAppStore';
import BigButton from '../components/BigButton';

function toLocalDatetimeValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const TRAILER_TYPES = [
  { value: 'tent',  label: 'Тент',          emoji: '🚛' },
  { value: 'ref',   label: 'Рефрижератор',   emoji: '❄️' },
  { value: 'box',   label: 'Будка',          emoji: '📦' },
  { value: 'other', label: 'Інше',           emoji: '🔧' },
];

export default function ShiftStartPage() {
  const navigate = useNavigate();
  const setActiveShift = useAppStore((s) => s.setActiveShift);

  const [form, setForm] = useState({
    truck_number:     '',
    trailer_number:   '',
    trailer_type:     'tent',
    card_inserted_at: toLocalDatetimeValue(),
    odometer_start:   '',
    ref_hours_start:  '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRef = form.trailer_type === 'ref';

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleStart = async () => {
    setError('');
    if (!form.truck_number.trim()) return setError('Введіть номер тягача');
    if (!form.odometer_start) return setError('Введіть показники одометра');
    if (isRef && !form.ref_hours_start) return setError('Введіть мотогодини рефрижератора');

    setLoading(true);
    try {
      const res = await api.post('/shifts/start', {
        truck_number:    form.truck_number.toUpperCase().trim(),
        trailer_number:  form.trailer_number.toUpperCase().trim() || undefined,
        trailer_type:    form.trailer_type,
        card_inserted_at: form.card_inserted_at,
        odometer_start:  parseInt(form.odometer_start),
        ref_hours_start: isRef ? parseFloat(form.ref_hours_start) : undefined,
      });
      setActiveShift(res.data);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 409) {
        // Already active — just navigate
        setActiveShift(err.response.data.shift);
        navigate('/dashboard');
      } else {
        setError(err.response?.data?.error || 'Помилка при відкритті зміни');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800 to-app-bg px-5 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <Truck size={26} className="text-amber-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">TachoDrive</p>
            <h1 className="text-2xl font-bold text-slate-50">Відкрити зміну</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pb-8 space-y-5 max-w-lg mx-auto w-full">
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-4 text-red-400 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Truck number */}
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Номер тягача *
          </label>
          <div className="relative">
            <Truck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={form.truck_number}
              onChange={(e) => set('truck_number', e.target.value)}
              placeholder="AA 1234 BB"
              autoCapitalize="characters"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-11 pr-4 py-4 text-slate-50 text-xl font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent uppercase"
            />
          </div>
        </div>

        {/* Trailer number */}
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Номер причепа
          </label>
          <input
            type="text"
            value={form.trailer_number}
            onChange={(e) => set('trailer_number', e.target.value)}
            placeholder="TR 0001"
            autoCapitalize="characters"
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-slate-50 text-lg font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 uppercase"
          />
        </div>

        {/* Trailer type */}
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Тип причепа *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TRAILER_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => set('trailer_type', t.value)}
                className={[
                  'flex items-center gap-3 rounded-2xl px-4 py-4 border-2 transition-all duration-150 text-left',
                  form.trailer_type === t.value
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500',
                ].join(' ')}
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="font-semibold text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card inserted at */}
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            <Clock size={13} className="inline mr-1" />
            Час вставляння карти *
          </label>
          <input
            type="datetime-local"
            value={form.card_inserted_at}
            onChange={(e) => set('card_inserted_at', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-slate-50 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Odometer start */}
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            <Gauge size={13} className="inline mr-1" />
            Одометр початок (км) *
          </label>
          <input
            type="number"
            value={form.odometer_start}
            onChange={(e) => set('odometer_start', e.target.value)}
            placeholder="125000"
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-slate-50 text-xl font-mono font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Ref hours — conditional */}
        {isRef && (
          <div className="animate-fade-in">
            <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              <Thermometer size={13} className="inline mr-1" />
              Мотогодини рефрижератора *
            </label>
            <input
              type="number"
              step="0.1"
              value={form.ref_hours_start}
              onChange={(e) => set('ref_hours_start', e.target.value)}
              placeholder="1234.5"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-slate-50 text-xl font-mono font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Submit */}
        <BigButton
          color="green"
          size="xl"
          onClick={handleStart}
          disabled={loading}
          icon={ChevronRight}
          className="mt-4"
        >
          {loading ? 'Відкриваємо зміну...' : 'РОЗПОЧАТИ ЗМІНУ'}
        </BigButton>
      </div>
    </div>
  );
}
