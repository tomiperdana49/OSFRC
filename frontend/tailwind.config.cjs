/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1e3a8a',
                    dark: '#1e3a8a',
                },
                secondary: {
                    DEFAULT: '#3b82f6',
                },
                accent: {
                    DEFAULT: '#ef4444',
                },
                success: {
                    DEFAULT: '#10b981',
                },
                background: '#f3f4f6',
            }
        },
    },
    plugins: [],
}
