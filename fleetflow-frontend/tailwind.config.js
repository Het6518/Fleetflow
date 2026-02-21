/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Background colors with opacity
    'bg-emerald-500/20', 'bg-amber-500/20', 'bg-red-500/20', 'bg-gray-500/20', 'bg-brand-500/20',
    'bg-emerald-600/20', 'bg-amber-600/20', 'bg-red-600/20', 'bg-gray-600/20', 'bg-violet-600/20',
    'bg-brand-600', 'bg-brand-600/20',
    // Text colors
    'text-emerald-400', 'text-amber-400', 'text-red-400', 'text-gray-400', 'text-brand-400', 'text-violet-400',
    // Border colors
    'border-emerald-500/30', 'border-amber-500/30', 'border-red-500/30', 'border-gray-500/30', 'border-brand-500/30',
    'border-emerald-600/20', 'border-amber-600/20', 'border-red-600/20', 'border-brand-600/20', 'border-violet-600/20',
    // Gradient colors
    'from-brand-600/20', 'from-emerald-600/20', 'from-amber-600/20', 'from-red-600/20', 'from-violet-600/20',
    'to-brand-500/5', 'to-emerald-500/5', 'to-amber-500/5', 'to-red-500/5', 'to-violet-500/5',
    // Progress bar colors
    'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-gray-500',
    // Hover
    'hover:bg-emerald-600/20', 'hover:text-emerald-400', 'hover:text-brand-400', 'hover:text-red-400',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
