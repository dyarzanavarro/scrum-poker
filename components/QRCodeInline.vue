<template>
    <div class="border p-2 rounded bg-white">
      <qrcode-vue
        :value="`https://yourapp.com/session/${sessionId}`"
        :size="64"
        level="M"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import QrcodeVue from 'qrcode.vue'
  
  const props = defineProps<{ sessionId: string }>()
  </script>
  