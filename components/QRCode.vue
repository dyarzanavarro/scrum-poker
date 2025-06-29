<template>
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-sm space-y-4 text-center relative">
        <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-400 hover:text-black text-xl">
          &times;
        </button>
  
        <h2 class="text-lg font-bold mb-2">📱 Join this Session</h2>
        <p class="text-sm text-gray-600">Scan the QR code or copy the link below.</p>
  
        <qrcode-vue :value="url" :size="180" class="mx-auto" />
  
        <div class="bg-gray-100 rounded px-4 py-2 text-sm text-left break-all">
          {{ url }}
        </div>
  
        <button
          @click="copyLink"
          class="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          {{ copied ? "✅ Copied!" : "Copy Link" }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import QrcodeVue from 'qrcode.vue'
  
  const props = defineProps<{
    sessionId: string
    show: boolean
  }>()
  
  const emit = defineEmits(['close'])
  
  const copied = ref(false)
  
  const url = `${location.origin}/session/${props.sessionId}`
  
  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
  </script>
  