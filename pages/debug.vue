<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Content Navigation</h1>
    <ContentNavigation v-slot="{ navigation }">
      <pre class="text-sm bg-gray-100 p-4 rounded overflow-x-auto">{{ navigation }}</pre>
    </ContentNavigation>
  </div>
</template>