<template>
  <footer class="text-center text-xs text-gray-400 dark:text-gray-500 py-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
    <div class="flex flex-col sm:flex-row justify-center gap-4">
      <p>
        Built with ❤️ by DYN.
        <a href="https://github.com/dyarzanavarro" class="underline hover:text-black dark:hover:text-white">GitHub</a>
      </p>
      <nav class="flex justify-center gap-4 mt-4 sm:mt-0">
        <NuxtLink to="/privacy" class="underline hover:text-black dark:hover:text-white">Privacy</NuxtLink>
        <NuxtLink to="/tracking" class="underline hover:text-black dark:hover:text-white">Tracking</NuxtLink>
        <NuxtLink to="/terms" class="underline hover:text-black dark:hover:text-white">Terms</NuxtLink>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
// nothing needed
</script>
