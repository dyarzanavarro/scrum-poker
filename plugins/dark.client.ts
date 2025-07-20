export default defineNuxtPlugin(() => {
    if (process.client) {
        document.documentElement.classList.add('dark')
    }
})