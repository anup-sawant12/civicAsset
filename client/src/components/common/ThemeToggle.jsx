import { Sun, Moon } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

export function ThemeToggle({ className = '', showLabel = false, size = 'default' }) {
  const { isDark, toggleTheme } = useTheme();

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-all duration-200 cursor-pointer ${
        isSmall ? 'p-1.5 text-xs' : 'px-2.5 py-1.5 text-xs'
      } ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 hover:border-amber-400/40 shadow-sm'
          : 'bg-white hover:bg-slate-100 text-amber-500 border-slate-200 hover:border-amber-400/50 shadow-xs'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <>
          <Sun className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-400 transition-transform duration-300 hover:rotate-90`} />
          {showLabel && <span className="text-slate-200 text-xs font-semibold">Light</span>}
        </>
      ) : (
        <>
          <Moon className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-indigo-600 transition-transform duration-300 hover:-rotate-45`} />
          {showLabel && <span className="text-slate-800 text-xs font-semibold">Dark</span>}
        </>
      )}
    </button>
  );
}

export default ThemeToggle;
