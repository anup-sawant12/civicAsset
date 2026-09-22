/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        // High-end clean light mode slate palettes
        primary: {
          50: '#f8fafc',  // Slate-50 (Main light background)
          100: '#f1f5f9', // Slate-100 (Secondary backgrounds)
          200: '#e2e8f0', // Slate-200 (Dividers, borders)
          300: '#cbd5e1', // Slate-300
          400: '#94a3b8', // Slate-400
          500: '#64748b', // Slate-500
          600: '#475569', // Slate-600
          700: '#334155', // Slate-700
          800: '#1e293b', // Slate-800
          900: '#0f172a', // Slate-900 (Dark titles/texts)
          950: '#020617', // Slate-950
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb', // Royal Blue
          600: '#1d4ed8', // Darker Royal Blue
          700: '#1e40af',
          glow: '#3b82f6',
        },
        cyber: {
          teal: '#0d9488', // Teal-600
          cyan: '#0891b2', // Cyan-600
          pink: '#db2777', // Pink-600
        },
        success: '#059669', // Emerald-600
        warning: '#d97706', // Amber-600
        danger: '#dc2626',  // Red-600
        info: '#2563eb',    // Blue-600
      },
      boxShadow: {
        'accent-glow': '0 0 15px rgba(37, 99, 235, 0.15)',
        'soft': '0 8px 30px rgba(15, 23, 42, 0.04)',
        'medium': '0 10px 40px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
