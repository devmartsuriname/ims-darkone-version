import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // IMS Brand Colors
        primary: {
          50: 'hsl(258, 80%, 97%)',
          100: 'hsl(258, 70%, 94%)',
          200: 'hsl(258, 70%, 87%)',
          300: 'hsl(258, 70%, 75%)',
          400: 'hsl(258, 70%, 60%)',
          500: 'hsl(258, 70%, 50%)', // #7e67fe
          600: 'hsl(258, 70%, 42%)',
          700: 'hsl(258, 70%, 35%)',
          800: 'hsl(258, 70%, 28%)',
          900: 'hsl(258, 70%, 20%)',
          950: 'hsl(258, 70%, 12%)',
        },
        secondary: {
          50: 'hsl(210, 16%, 95%)',
          100: 'hsl(210, 16%, 90%)',
          200: 'hsl(210, 16%, 80%)',
          300: 'hsl(210, 16%, 65%)',
          400: 'hsl(210, 16%, 50%)',
          500: 'hsl(210, 16%, 35%)', // #424e5a
          600: 'hsl(210, 16%, 30%)',
          700: 'hsl(210, 16%, 25%)',
          800: 'hsl(210, 16%, 20%)',
          900: 'hsl(210, 16%, 15%)',
        },
        accent: {
          50: 'hsl(195, 95%, 95%)',
          100: 'hsl(195, 95%, 88%)',
          200: 'hsl(195, 95%, 75%)',
          300: 'hsl(195, 95%, 60%)',
          400: 'hsl(195, 95%, 45%)',
          500: 'hsl(195, 95%, 35%)', // #1ab0f8
          600: 'hsl(195, 95%, 30%)',
          700: 'hsl(195, 95%, 25%)',
          800: 'hsl(195, 95%, 20%)',
          900: 'hsl(195, 95%, 15%)',
        },
        success: {
          50: 'hsl(140, 80%, 95%)',
          100: 'hsl(140, 80%, 88%)',
          200: 'hsl(140, 80%, 75%)',
          300: 'hsl(140, 80%, 60%)',
          400: 'hsl(140, 80%, 45%)',
          500: 'hsl(140, 80%, 35%)', // #21d760
          600: 'hsl(140, 80%, 30%)',
          700: 'hsl(140, 80%, 25%)',
          800: 'hsl(140, 80%, 20%)',
          900: 'hsl(140, 80%, 15%)',
        },
        warning: {
          50: 'hsl(25, 85%, 95%)',
          100: 'hsl(25, 85%, 88%)',
          200: 'hsl(25, 85%, 75%)',
          300: 'hsl(25, 85%, 62%)',
          400: 'hsl(25, 85%, 50%)',
          500: 'hsl(25, 85%, 40%)', // #f0934e
          600: 'hsl(25, 85%, 35%)',
          700: 'hsl(25, 85%, 30%)',
          800: 'hsl(25, 85%, 25%)',
          900: 'hsl(25, 85%, 20%)',
        },
        danger: {
          50: 'hsl(6, 80%, 95%)',
          100: 'hsl(6, 80%, 88%)',
          200: 'hsl(6, 80%, 75%)',
          300: 'hsl(6, 80%, 62%)',
          400: 'hsl(6, 80%, 50%)',
          500: 'hsl(6, 80%, 42%)', // #ed321f
          600: 'hsl(6, 80%, 37%)',
          700: 'hsl(6, 80%, 32%)',
          800: 'hsl(6, 80%, 27%)',
          900: 'hsl(6, 80%, 22%)',
        },
        // Surface Colors
        background: 'hsl(248, 60%, 98%)',
        surface: 'hsl(248, 60%, 96%)',
        muted: 'hsl(210, 16%, 92%)',
        border: 'hsl(210, 16%, 85%)',
        // Text Colors
        foreground: 'hsl(210, 16%, 15%)',
        'muted-foreground': 'hsl(210, 16%, 45%)',
      },
      fontFamily: {
        sans: ['Play', 'system-ui', 'sans-serif'],
        display: ['Play', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px hsl(210, 16%, 85%)',
        'medium': '0 4px 16px -4px hsl(210, 16%, 80%)',
        'large': '0 8px 32px -8px hsl(210, 16%, 75%)',
        'glow': '0 0 24px hsl(258, 70%, 50%, 0.25)',
        'inner-soft': 'inset 0 1px 2px hsl(210, 16%, 90%)',
      },
      animation: {
        // Enhanced animations
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px hsl(258, 70%, 50%, 0.3)' },
          '100%': { boxShadow: '0 0 30px hsl(258, 70%, 50%, 0.6)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config