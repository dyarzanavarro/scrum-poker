export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    'nuxt-gtag',
    '@nuxtjs/google-adsense',
    '@nuxt/content',
    '@nuxtjs/turnstile',
  ],

  ssr: true,
  content: {
    highlight: {
      theme: 'github-dark',
      preload: ['javascript', 'typescript', 'html', 'css'],
    },
    documentDriven: true, // enable Nuxt Content to generate routes
  },
  nitro: {
    prerender: {
      routes: ['/blog', '/blog/distributed-agile-teams'],
    },
  },

  gtag: {
    id: 'G-248JBX6J6P',
  },
  googleAdsense: {
    id: 'ca-pub-1741608972034726'
  },

  supabase: {
    redirect: false,
  },

  turnstile: {
    siteKey: '0x4AAAAAABlxy_WYgQpl9Qrm',
  },

  runtimeConfig: {
    turnstile: {
      // This can be overridden at runtime via the NUXT_TURNSTILE_SECRET_KEY
      // environment variable.
      secretKey: 'NUXT_TURNSTILE_SECRET_KEY',
    },
  },

  css: ['@/assets/tailwind.css'],
})