// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss', 'nuxt-gtag', '@nuxtjs/google-adsense'],

  gtag: {
    id: 'G-248JBX6J6P',
  },
  googleAdsense: {
    id: 'ca-pub-1741608972034726'
  },

  supabase: {
    redirect: false,
  },
  css: ['@/assets/tailwind.css'],
})