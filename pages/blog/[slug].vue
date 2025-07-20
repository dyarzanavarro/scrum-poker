<template>
  <ContentRenderer v-if="data" :value="data" />
  <div v-else>Home not found</div>
</template>

<script setup>
const { params } = useRoute()
const { data } = await useAsyncData(() => queryContent(`/blog/${params.slug}`).findOne())
</script>