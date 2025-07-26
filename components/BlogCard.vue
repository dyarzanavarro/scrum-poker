<template>
  <NuxtLink :to="post._path" class="block rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
    <div class="space-y-2">
      <img
        v-if="post.cover"
        :src="post.cover"
        alt="cover image"
        class="w-full h-40 object-cover rounded mb-2"
      />
      <h2 class="text-xl font-semibold">{{ post.title }}</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(post.publishedAt) }}</p>
      <p class="text-gray-700 dark:text-gray-300 text-sm">{{ post.description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  post: {
    _path: string
    title: string
    description: string
    publishedAt: string
    cover?: string
  }
}>()

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
</script>
