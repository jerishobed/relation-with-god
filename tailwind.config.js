/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sanctuary: {
          50: '#FAF8F5',
          100: '#F4EFEB',
          200: '#E7DDD2',
          300: '#D5C4B1',
          400: '#BAA287',
          500: '#9E8264',
          600: '#83674B',
          700: '#644D36',
          800: '#3D2E1F',
          900: '#231A12',
          950: '#120D09',
        },
        gold: {
          100: '#FBF5DF',
          200: '#F5E6B5',
          300: '#EFD484',
          400: '#E3C152',
          500: '#D4AF37',
          600: '#B89222',
          700: '#917116',
          800: '#6B5210',
          900: '#483609',
        },
        sacred: {
          50: '#FDF3F4',
          100: '#FCE7E9',
          200: '#F8D0D4',
          300: '#F1ACB3',
          400: '#E67A86',
          500: '#D74F5F',
          600: '#BA3142',
          700: '#8C1F2D',
          800: '#68141F',
          900: '#470D15',
          950: '#2A060B',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        scripture: ['Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(212, 175, 55, 0.35)',
        'glow-soft': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'inner-parchment': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
