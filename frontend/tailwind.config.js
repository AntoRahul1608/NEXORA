/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                dark: {
                    100: '#eceefb',
                    200: '#8589a8',
                    300: '#5c5f7a',
                    400: '#1c1e33',
                    500: '#242640',
                    600: '#1b1d2e',
                    700: '#151725',
                    750: '#131421',
                    800: '#10111a',
                    850: '#0c0d16',
                    900: '#08090f',
                },
                accent: {
                    primary: '#ff9640',
                    secondary: '#18d6b0',
                    tertiary: '#8b7bff',
                    warning: '#ff9640',
                    error: '#ff5c7a',
                    success: '#18d6b0',
                },
            },
        },
    },
    plugins: [],
}