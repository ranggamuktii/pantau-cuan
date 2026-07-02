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
            }
        },
    },

    plugins: [forms],
};
