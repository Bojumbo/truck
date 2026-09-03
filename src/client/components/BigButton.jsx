import React from 'react';

const colorMap = {
  amber:  'bg-amber-500  hover:bg-amber-400  active:bg-amber-600  text-slate-900  border-amber-400',
  blue:   'bg-blue-500   hover:bg-blue-400   active:bg-blue-600   text-white       border-blue-400',
  green:  'bg-green-500  hover:bg-green-400  active:bg-green-600  text-white       border-green-400',
  red:    'bg-red-500    hover:bg-red-400    active:bg-red-600    text-white       border-red-400',
  purple: 'bg-purple-500 hover:bg-purple-400 active:bg-purple-600 text-white       border-purple-400',
  slate:  'bg-slate-700  hover:bg-slate-600  active:bg-slate-800  text-white       border-slate-600',
  outline:'bg-transparent hover:bg-slate-700 active:bg-slate-800   text-slate-300  border-slate-600',
};

const activeGlowMap = {
  amber:  'ring-2 ring-amber-400  ring-offset-2 ring-offset-slate-900 shadow-lg shadow-amber-500/40',
  blue:   'ring-2 ring-blue-400   ring-offset-2 ring-offset-slate-900 shadow-lg shadow-blue-500/40',
  green:  'ring-2 ring-green-400  ring-offset-2 ring-offset-slate-900 shadow-lg shadow-green-500/40',
  red:    'ring-2 ring-red-400    ring-offset-2 ring-offset-slate-900 shadow-lg shadow-red-500/40',
  purple: 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-purple-500/40',
  slate:  'ring-2 ring-slate-400  ring-offset-2 ring-offset-slate-900',
  outline:'ring-2 ring-slate-500  ring-offset-2 ring-offset-slate-900',
};

export default function BigButton({
  children,
  icon: Icon,
  color = 'slate',
  onClick,
  disabled = false,
  isActive = false,
  fullWidth = true,
  size = 'lg', // 'lg' | 'xl'
  className = '',
}) {
  const sizeClasses = size === 'xl'
    ? 'min-h-[80px] px-6 py-4 text-xl font-bold gap-4'
    : 'min-h-[64px] px-5 py-3 text-lg font-semibold gap-3';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'btn-ripple',
        'relative flex items-center justify-center',
        'rounded-2xl border transition-all duration-150 select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        colorMap[color] || colorMap.slate,
        isActive ? activeGlowMap[color] || activeGlowMap.slate : '',
        fullWidth ? 'w-full' : '',
        sizeClasses,
        className,
      ].join(' ')}
    >
      {Icon && <Icon size={size === 'xl' ? 28 : 24} strokeWidth={2} />}
      {children}
      {isActive && (
        <span className="absolute top-2 right-3 flex items-center gap-1">
          <span className="animate-pulse w-2 h-2 rounded-full bg-white opacity-80" />
        </span>
      )}
    </button>
  );
}
