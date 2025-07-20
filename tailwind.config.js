export default {
    darkMode: 'class', // 🔥 This is missing
    content: [
        './components/**/*.{vue,js,ts}',
        './pages/**/*.{vue,js,ts}',
        './layouts/**/*.{vue,js,ts}',
        './app.vue',
        './assets/css/**/*.{css,scss}',
    ],
    theme: {
        extend: {
            // your custom colors, animations, etc.
        }
    },
    plugins: []
}