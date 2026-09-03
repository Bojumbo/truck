import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Navigation, CreditCard, XCircle, WifiOff } from 'lucide-react';
import StatusBanner from '../components/StatusBanner';
import CloseShiftModal from '../components/CloseShiftModal';
import BigButton from '../components/BigButton';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const up   = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col">
      {/* Top safe area + header */}
      <div className="bg-gradient-to-b from-slate-900 to-app-bg px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-50">🚛 Зміна</h1>
          {!isOnline && (
            <div className="flex items-center gap-1.5 bg-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              <WifiOff size={12} />
              Офлайн
            </div>
          )}
        </div>

        <StatusBanner onlineStatus={isOnline} />
      </div>

      {/* Main nav tiles */}
      <div className="flex-1 px-5 pb-6 max-w-lg mx-auto w-full">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
          Розділи
        </p>

        <div className="space-y-3">
          {/* TACHO */}
          <button
            onClick={() => navigate('/tacho')}
            className="btn-ripple w-full card px-5 py-5 flex items-center gap-4 hover:border-amber-500/50 hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
              <Clock size={28} className="text-amber-400" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-lg font-bold text-slate-50">Тахограф</p>
              <p className="text-slate-400 text-sm">Молотки · Ліжечко · Їзда</p>
            </div>
            <div className="ml-auto text-slate-600">›</div>
          </button>

          {/* DRIVING */}
          <button
            onClick={() => navigate('/driving')}
            className="btn-ripple w-full card px-5 py-5 flex items-center gap-4 hover:border-green-500/50 hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
              <Navigation size={28} className="text-green-400" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-lg font-bold text-slate-50">Їзда</p>
              <p className="text-slate-400 text-sm">Транзит · Кордон · Вантаж</p>
            </div>
            <div className="ml-auto text-slate-600">›</div>
          </button>

          {/* EXPENSES */}
          <button
            onClick={() => navigate('/expenses')}
            className="btn-ripple w-full card px-5 py-5 flex items-center gap-4 hover:border-blue-500/50 hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
              <CreditCard size={28} className="text-blue-400" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-lg font-bold text-slate-50">Витрати</p>
              <p className="text-slate-400 text-sm">Паливо · Дороги · Паркінг</p>
            </div>
            <div className="ml-auto text-slate-600">›</div>
          </button>
        </div>
      </div>

      {/* Close shift button */}
      <div className="px-5 pb-8 max-w-lg mx-auto w-full">
        <BigButton
          color="red"
          icon={XCircle}
          onClick={() => setShowCloseModal(true)}
          size="lg"
        >
          ЗАКРИТИ ЗМІНУ
        </BigButton>
      </div>

      <CloseShiftModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
      />
    </div>
  );
}
