/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Pop Strike Color Palette
        'surface': '#190047',
        'surface-dim': '#190047',
        'surface-bright': '#4500a8',
        'surface-container-lowest': '#13003a',
        'surface-container-low': '#22005c',
        'surface-container': '#270067',
        'surface-container-high': '#330081',
        'surface-container-highest': '#40009d',
        'on-surface': '#e9ddff',
        'on-surface-variant': '#d3c5ab',
        'inverse-surface': '#e9ddff',
        'inverse-on-surface': '#3b0092',
        'outline': '#9c8f78',
        'outline-variant': '#4f4632',
        'surface-tint': '#f9bd04',
        'primary': '#ffe5b3',
        'on-primary': '#3f2e00',
        'primary-container': '#ffc312',
        'on-primary-container': '#6e5200',
        'inverse-primary': '#785a00',
        'secondary': '#41e5b3',
        'on-secondary': '#003829',
        'secondary-container': '#00c899',
        'on-secondary-container': '#004d39',
        'tertiary': '#ffe1df',
        'on-tertiary': '#68000e',
        'tertiary-container': '#ffbbb7',
        'on-tertiary-container': '#a71d27',
        'error': '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        'primary-fixed': '#ffdf9c',
        'primary-fixed-dim': '#f9bd04',
        'on-primary-fixed': '#251a00',
        'on-primary-fixed-variant': '#5b4300',
        'secondary-fixed': '#5ffcc9',
        'secondary-fixed-dim': '#38dfae',
        'on-secondary-fixed': '#002116',
        'on-secondary-fixed-variant': '#00513c',
        'tertiary-fixed': '#ffdad7',
        'tertiary-fixed-dim': '#ffb3af',
        'on-tertiary-fixed': '#410005',
        'on-tertiary-fixed-variant': '#910719',
        'background': '#190047',
        'on-background': '#e9ddff',
        'surface-variant': '#40009d',

        // Brand & Style specific naming
        'neo-bg': '#5F27CD', // Deep Neo-Pop Purple
        'neo-primary': '#FFC312', // Cyber Yellow
        'neo-success': '#1DD1A1', // Mint Green
        'neo-danger': '#EE5253', // Crimson Red

        // Legacy compatibility
        indonesia: {
          red:      '#DC2626',
          redGlow:  '#EF4444',
          dark:     '#1E293B',
          card:     '#FFFFFF',
          accent:   '#D97706',
        }
      },
      boxShadow: {
        'neo': '6px 6px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo-md': '4px 4px 0px 0px #000000',
        'neo-lg': '8px 8px 0px 0px #000000',
        'neo-inset': 'inset 2px 2px 4px rgba(0, 0, 0, 0.4)',
        // Legacy
        'glow-red':    '0 0 0 3px rgba(220, 38, 38, 0.15)',
        'glow-green':  '0 0 0 3px rgba(22, 163, 74, 0.15)',
        'glow-yellow': '0 0 0 3px rgba(217, 119, 6, 0.15)',
        'flat':        '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'flat-md':     '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'flat-lg':     '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(135deg, #190047 0%, #13003a 100%)',
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'Inter', 'sans-serif'],
        rubik: ['"Rubik-ExtraBold"', 'Rubik', 'sans-serif'],
        'rubik-italic': ['"Rubik-Italic"', 'Rubik', 'sans-serif'],
        hanken: ['"Hanken Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono-Regular"', '"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        'full': '9999px',
      },
      spacing: {
        'unit': '8px',
        'gutter': '24px',
        'margin': '32px',
      },
      borderWidth: {
        '3': '3px',
        '5': '5px',
        '6': '6px',
      }
    },
  },
  plugins: [],
}
