import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, User, MessageSquare, DollarSign, Receipt } from 'lucide-react';
import api from '../api/index';
import { useAppStore } from '../store/useAppStore';
import BigButton from '../components/BigButton';

const CATEGORIES = [
  { value: 'fuel',    label: 'Паливо',   emoji: '⛽' },
  { value: 'adblue',  label: 'AdBlue',   emoji: '💧' },
  { value: 'toll',    label: 'Дороги',   emoji: '🛣' },
  { value: 'parking', label: 'Паркінг',  emoji: '🅿️' },
  { value: 'repair',  label: 'Ремонт',   emoji: '🔧' },
  { value: 'other',   label: 'Інше',     emoji: '📋' },
];

const CURRENCIES = ['EUR', 'PLN', 'UAH', 'USD'];

const paymentTypeLabels = { company: 'Компанія', personal: 'Особисті' };
const categoryLabels = { fuel: '⛽ Паливо', adblue: '💧 AdBlue', toll: '🛣 Дороги', parking: '🅿️ Паркінг', repair: '🔧 Ремонт', other: '📋 Інше' };

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

function formatAmount(amount, currency) {
  return `${Number(amount).toFixed(2)} ${currency}`;
}

export default function ExpensesPage() {
  const navigate = useNavigate();
  const activeShift = useAppStore((s) => s.activeShift);

  const [paymentType, setPaymentType] = useState(null); // null | 'company' | 'personal'
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = useCallback(async () => {
    if (!activeShift?.id) return;
    try {
      const res = await api.get(`/expenses/${activeShift.id}`);
      setExpenses((res.data || []).slice().reverse());
    } catch (err) {
      console.warn('fetchExpenses:', err.message);
    }
  }, [activeShift?.id]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const resetForm = () => {
    setCategory('');
    setAmount('');
    setComment('');
    setError('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!paymentType) return setError('Оберіть тип оплати');
    if (!category) return setError('Оберіть категорію');
    if (!amount || isNaN(parseFloat(amount))) return setError('Введіть суму');

    setLoading(true);
    try {
      await api.post('/expenses', {
        shift_id: activeShift.id,
        payment_type: paymentType,
        category,
        amount: parseFloat(amount),
        currency,
        comment: comment.trim() || undefined,
        timestamp: new Date().toISOString(),
      });
      setSuccess('✅ Витрата збережена');
      resetForm();
      await fetchExpenses();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка збереження');
    } finally {
      setLoading(false);
    }
  };

  // Group expenses totals
  const companyTotal = expenses.filter(e => e.payment_type === 'company')
    .reduce((acc, e) => acc + Number(e.amount), 0);
  const personalTotal = expenses.filter(e => e.payment_type === 'personal')
    .reduce((acc, e) => acc + Number(e.amount), 0);

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
          <h1 className="text-2xl font-bold text-slate-50">💳 Витрати</h1>
        </div>

        {/* Totals row */}
        {expenses.length > 0 && (
          <div className="flex gap-3 mt-2">
            <div className="flex-1 card px-3 py-2.5 flex items-center gap-2">
              <Building2 size={16} className="text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-slate-500 text-xs">Компанія</p>
                <p className="text-blue-400 font-bold font-mono">{companyTotal.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex-1 card px-3 py-2.5 flex items-center gap-2">
              <User size={16} className="text-green-400 flex-shrink-0" />
              <div>
                <p className="text-slate-500 text-xs">Особисті</p>
                <p className="text-green-400 font-bold font-mono">{personalTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="px-5 space-y-4 max-w-lg mx-auto w-full flex-1">
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-3 text-red-400 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/40 rounded-2xl p-3 text-green-400 text-sm font-medium animate-fade-in">
            {success}
          </div>
        )}

        {/* Payment type */}
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-2">
            Тип оплати *
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentType('company')}
              className={[
                'flex items-center gap-3 rounded-2xl px-4 py-4 border-2 transition-all duration-150',
                paymentType === 'company'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500',
              ].join(' ')}
            >
              <Building2 size={22} />
              <span className="font-semibold">Компанія</span>
            </button>
            <button
              onClick={() => setPaymentType('personal')}
              className={[
                'flex items-center gap-3 rounded-2xl px-4 py-4 border-2 transition-all duration-150',
                paymentType === 'personal'
                  ? 'bg-green-500/20 border-green-500 text-green-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500',
              ].join(' ')}
            >
              <User size={22} />
              <span className="font-semibold">Власні</span>
            </button>
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-2">
            Категорія *
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={[
                  'flex flex-col items-center gap-1 rounded-2xl px-2 py-3 border-2 transition-all duration-150',
                  category === cat.value
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500',
                ].join(' ')}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-semibold">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount + Currency */}
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-2">
            <DollarSign size={11} className="inline" /> Сума *
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-slate-50 text-2xl font-mono font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-2xl px-3 py-4 text-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-slate-500 min-w-[80px]"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comment */}
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-2">
            <MessageSquare size={11} className="inline" /> Коментар
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Назва АЗС, номер чека…"
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-slate-50 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        <BigButton
          color="amber"
          size="lg"
          onClick={handleSave}
          disabled={loading}
          icon={Receipt}
        >
          {loading ? 'Зберігаємо...' : 'ЗБЕРЕГТИ ВИТРАТУ'}
        </BigButton>
      </div>

      {/* Expenses list */}
      {expenses.length > 0 && (
        <div className="px-5 mt-6 mb-8 max-w-lg mx-auto w-full">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Витрати зміни
          </p>
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div key={exp.id} className="card px-4 py-3 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">
                  {CATEGORIES.find(c => c.value === exp.category)?.emoji || '📋'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-slate-200 font-semibold text-sm">
                      {categoryLabels[exp.category]}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      exp.payment_type === 'company'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {paymentTypeLabels[exp.payment_type]}
                    </span>
                  </div>
                  {exp.comment && (
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{exp.comment}</p>
                  )}
                  <p className="text-slate-500 text-xs">{formatTime(exp.timestamp)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold font-mono text-slate-100">
                    {formatAmount(exp.amount, exp.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
