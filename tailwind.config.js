/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'status-idle': '#10B981',      // Green
        'status-printing': '#2563EB',  // Blue
        'status-error': '#EF4444',     // Red
        'status-queued': '#6B7280',    // Gray
      },
      fontSize: {
        'dashboard-title': ['3rem', { lineHeight: '1.2' }],
        'dashboard-name': ['2.25rem', { lineHeight: '1.2' }],
        'dashboard-label': ['1.5rem', { lineHeight: '1.5' }],
        'dashboard-text': ['1.25rem', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
}
