import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        ripple: 'ripple 1s linear',
        'expand-circle': 'expand-circle 1s ease-in-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(20)', opacity: '0' },
        },
        'expand-circle': {
          '0%': { 
            clipPath: 'circle(64px at center)',
            opacity: '0'
          },
          '10%': { 
            opacity: '1'
          },
          '100%': { 
            clipPath: 'circle(100% at center)',
            opacity: '1'
          }
        }
      },
    },
  },
  plugins: [],
};

export default config; 