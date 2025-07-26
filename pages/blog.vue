<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-6 py-12">
    <div class="max-w-3xl mx-auto space-y-8">
      <h1 class="text-4xl font-bold mb-8">Agile Blog</h1>

      <div v-if="posts?.length" class="grid gap-6">
        <BlogCard v-for="post in posts" :key="post._path" :post="post" />
      </div>
   

      <div v-else class="text-gray-500 dark:text-gray-400 text-sm">No posts found.</div>
           
    </div>
  </div>
</template>


<script setup lang="ts">
const { data: posts } = await useAsyncData('blog-index', async () => {
  const result = await queryContent('/blog').find()
  return result
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
