/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent: 'var(--accent)',
        hazard: 'var(--hazard)',
        'sev-low': 'var(--severity-low)',
        'sev-med': 'var(--severity-medium)',
        'sev-high': 'var(--severity-high)',
        'status-approved': 'var(--status-approved)',
        'status-pending': 'var(--status-pending)',
        'status-rejected': 'var(--status-rejected)',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '0px',
      },
    },
  },
  plugins: [],
}
