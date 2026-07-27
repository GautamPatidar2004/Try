
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'brand-green': 'hsl(var(--hostfluencer-green))',
				'brand-dark': 'hsl(var(--hostfluencer-dark))',
				'brand-light': 'hsl(var(--hostfluencer-light-green))',
				'brand-accent': 'hsl(var(--hostfluencer-accent))',
				'voyager-blue': 'hsl(var(--voyager-blue))',
				'voyager-dark': 'hsl(var(--voyager-dark))',
				'voyager-light': 'hsl(var(--voyager-light))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
		keyframes: {
			'accordion-down': {
				from: {
					height: '0'
				},
				to: {
					height: 'var(--radix-accordion-content-height)'
				}
			},
			'accordion-up': {
				from: {
					height: 'var(--radix-accordion-content-height)'
				},
				to: {
					height: '0'
				}
			},
			'fade-in': {
				'0%': {
					opacity: '0',
					transform: 'translateY(10px)'
				},
				'100%': {
					opacity: '1',
					transform: 'translateY(0)'
				}
			},
			'fade-out': {
				'0%': {
					opacity: '1',
					transform: 'translateY(0)'
				},
				'100%': {
					opacity: '0',
					transform: 'translateY(10px)'
				}
			},
			'scale-in': {
				'0%': {
					transform: 'scale(0.95)',
					opacity: '0'
				},
				'100%': {
					transform: 'scale(1)',
					opacity: '1'
				}
			},
			'scale-out': {
				from: { transform: 'scale(1)', opacity: '1' },
				to: { transform: 'scale(0.95)', opacity: '0' }
			},
			'slide-in-right': {
				'0%': { transform: 'translateX(100%)' },
				'100%': { transform: 'translateX(0)' }
			},
			'slide-out-right': {
				'0%': { transform: 'translateX(0)' },
				'100%': { transform: 'translateX(100%)' }
			},
			'slide-up': {
				'0%': { transform: 'translateY(100%)', opacity: '0' },
				'100%': { transform: 'translateY(0)', opacity: '1' }
			},
			'bounce-subtle': {
				'0%, 100%': { transform: 'translateY(0)' },
				'50%': { transform: 'translateY(-5px)' }
			},
			'pulse-glow': {
				'0%, 100%': { boxShadow: '0 0 20px hsl(162 78% 45% / 0.3)' },
				'50%': { boxShadow: '0 0 30px hsl(162 78% 45% / 0.5)' }
			},
		'gradient-shift': {
			'0%, 100%': { backgroundPosition: '0% 50%' },
			'50%': { backgroundPosition: '100% 50%' }
		},
		'blob': {
			'0%': { transform: 'translate(0px, 0px) scale(1)' },
			'33%': { transform: 'translate(30px, -50px) scale(1.1)' },
			'66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
			'100%': { transform: 'translate(0px, 0px) scale(1)' }
		},
		'shimmer-slide': {
			'0%': { backgroundPosition: '-200% center' },
			'100%': { backgroundPosition: '200% center' }
		},
		'float': {
			'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
			'50%': { transform: 'translateY(-20px) rotate(5deg)' }
		},
		'morph': {
			'0%, 100%': { borderRadius: '60% 40% 30% 70%' },
			'50%': { borderRadius: '30% 60% 70% 40%' }
		},
		'glow-pulse': {
			'0%, 100%': { 
				boxShadow: '0 0 20px hsl(var(--brand-green) / 0.4)',
				filter: 'brightness(1)' 
			},
			'50%': { 
				boxShadow: '0 0 40px hsl(var(--brand-green) / 0.8)',
				filter: 'brightness(1.2)' 
			}
		}
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'fade-in': 'fade-in 0.3s ease-out',
			'fade-out': 'fade-out 0.3s ease-out',
			'scale-in': 'scale-in 0.2s ease-out',
			'scale-out': 'scale-out 0.2s ease-out',
			'slide-in-right': 'slide-in-right 0.3s ease-out',
			'slide-out-right': 'slide-out-right 0.3s ease-out',
			'slide-up': 'slide-up 0.4s ease-out',
			'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
		'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
		'gradient-shift': 'gradient-shift 3s ease infinite',
		'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
		'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out',
		'blob': 'blob 7s infinite',
		'shimmer-slide': 'shimmer-slide 3s linear infinite',
		'float': 'float 3s ease-in-out infinite',
		'morph': 'morph 8s ease-in-out infinite',
		'glow-pulse': 'glow-pulse 2s ease-in-out infinite'
		},
		boxShadow: {
			'sm': '0 1px 2px 0 hsl(162 78% 45% / 0.05)',
			'md': '0 4px 6px -1px hsl(162 78% 45% / 0.1), 0 2px 4px -1px hsl(162 78% 45% / 0.06)',
			'lg': '0 10px 15px -3px hsl(162 78% 45% / 0.1), 0 4px 6px -2px hsl(162 78% 45% / 0.05)',
			'xl': '0 20px 25px -5px hsl(162 78% 45% / 0.1), 0 10px 10px -5px hsl(162 78% 45% / 0.04)',
			'2xl': '0 25px 50px -12px hsl(162 78% 45% / 0.15)',
			'glow': '0 0 20px hsl(162 78% 45% / 0.3)',
			'glow-lg': '0 0 30px hsl(162 78% 45% / 0.4)'
		}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
