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
			fontFamily: {
				'montserrat': ['Montserrat', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
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
				neon: {
					pink: 'hsl(var(--neon-pink))',
					cyan: 'hsl(var(--neon-cyan))',
					purple: 'hsl(var(--neon-purple))',
					yellow: 'hsl(var(--neon-yellow))',
					green: 'hsl(var(--neon-green))'
				}
			},
			backgroundImage: {
				'gradient-neon': 'var(--gradient-neon)',
				'gradient-sunset': 'var(--gradient-sunset)',
				'gradient-grid': 'var(--gradient-grid)'
			},
			boxShadow: {
				'neon': 'var(--shadow-neon)',
				'glow': 'var(--shadow-glow)'
			},
			transitionTimingFunction: {
				'neon': 'var(--transition-neon)'
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
				'epic-entry': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.8) translateY(40px)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1) translateY(0)'
					}
				},
				'float-medal': {
					'0%': {
						opacity: '0',
						transform: 'translateY(-100px) rotate(-180deg) scale(0.5)'
					},
					'60%': {
						opacity: '1',
						transform: 'translateY(10px) rotate(20deg) scale(1.1)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0px) rotate(0deg) scale(1)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						opacity: '1',
						boxShadow: '0 0 20px hsl(var(--primary) / 0.5)'
					},
					'50%': {
						opacity: '0.8',
						boxShadow: '0 0 40px hsl(var(--primary) / 0.8)'
					}
				},
				'counter-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'holographic': {
					'0%, 100%': {
						textShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary))'
					},
					'50%': {
						textShadow: '0 0 20px hsl(var(--secondary)), 0 0 30px hsl(var(--secondary)), 0 0 40px hsl(var(--secondary))'
					}
				},
				'meteor-shower': {
					'0%': {
						transform: 'translateX(-100px) translateY(-100px)',
						opacity: '0'
					},
					'10%': {
						opacity: '1'
					},
					'90%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateX(100vw) translateY(100vh)',
						opacity: '0'
					}
				},
				'orbit': {
					'0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
					'100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'epic-entry': 'epic-entry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
				'float-medal': 'float-medal 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'counter-up': 'counter-up 0.6s ease-out',
				'holographic': 'holographic 3s ease-in-out infinite',
				'meteor-shower': 'meteor-shower 3s linear infinite',
				'orbit': 'orbit 20s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
