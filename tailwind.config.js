import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                gojek: {
                    50: '#e5f6e7',
                    100: '#cceecf',
                    200: '#99de9f',
                    300: '#66cd6f',
                    400: '#33bd3f',
                    500: '#00aa13',
                    600: '#00880f',
                    700: '#00660b',
                    800: '#004407',
                    900: '#002203',
                }
            },
            animation: {
                blob: "blob 7s infinite",
                shimmer: "shimmer 2.5s linear infinite",
            },
            keyframes: {
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
                shimmer: {
                    "100%": {
                        transform: "translateX(100%)",
                    },
                },
            },
        },
    },

    plugins: [forms],
};
