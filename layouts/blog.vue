<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div class="max-w-3xl mx-auto px-6 py-12">
      <ContentDoc v-slot="{ doc }">
        <!-- Cover Image -->
        <img
          v-if="doc.cover"
          :src="doc.cover"
          alt="Cover image"
          class="w-full h-60 object-cover rounded mb-6"
        />

        <!-- Title -->
        <h1 class="text-4xl font-bold tracking-tight leading-tight mb-2">
          {{ doc.title }}
        </h1>

        <!-- Meta Info -->
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {{ formatDate(doc.publishedAt) }} · {{ getReadingTime(doc) }} min read
        </p>

        <!-- Main Content -->
        <article class="prose dark:prose-invert prose-lg max-w-none">
          <ContentRenderer :value="doc" />
        </article>
      </ContentDoc>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'

function formatDate(date?: string): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getReadingTime(doc: ParsedContent): number {
  const text = JSON.stringify(doc?.body)
  const wordCount = text.split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200)) // ~200 wpm
}
</script>
