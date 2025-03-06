/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [ "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
  	extend: {
		animation: {
			wave: 'wave 1s ease-in-out infinite',
		  },
		  keyframes: {
			wave: {
			  '0%, 100%': { height: '10px' },
			  '50%': { height: '50px' },
			},
		  },
		  animationDelay: {
			100: '0.1s',
			200: '0.2s',
			300: '0.3s',
			400: '0.4s',
			500: '0.5s',
		  },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px) !important',
  			sm: 'calc(var(--radius) - 4px) !important'
  		},
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Agregamos la fuente Inter
      },
  		colors: {
        footer: '#18181b',
        naranja: "#000000",
		verde: '#32AE41',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

