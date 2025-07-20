<template>
    <div class="fixed bottom-4 right-4 z-50">
      <div class="bg-white shadow-lg rounded-lg p-3 w-60 dark:bg-gray-600">
        <h3 class="text-sm font-semibold mb-2 text-gray-900">🎈 ADHD Corner</h3>
        <div class="flex flex-wrap gap-1 mb-2 text-xl">
          <span
            v-for="e in emojis"
            :key="e"
            class="cursor-pointer hover:scale-125 transition"
            @click="throwEmoji(e)"
          >
            {{ e }}
          </span>
        </div>
      </div>
  
      <!-- Emoji Rain Area -->
      <div class="pointer-events-none fixed inset-0 overflow-hidden z-40">
        <div
          v-for="e in fallingEmojis"
          :key="e.id"
          class="absolute text-3xl animate-fall"
          :style="{
            left: `${e.x}%`,
            top: '-2rem',
            animationDuration: `${e.duration}s`
          }"
        >
          {{ e.char }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const supabase = useSupabaseClient()
  const route = useRoute()
  const sessionId = route.params.id as string
  
  const emojis = ['🎉', '🔥', '🧠', '🚀', '🎈', '🎮', '🍕', '🍿']
  const fallingEmojis = ref<
    { id: number; char: string; x: number; delay: number; duration: number }[]
  >([])
  
  const emojiChannel = supabase.channel(`emoji-${sessionId}`)
  
  const throwEmoji = (emoji: string) => {
    addEmoji(emoji) // Show instantly
    emojiChannel.send({
      type: 'broadcast',
      event: 'emoji',
      payload: { emoji }
    })
  }
  
  const addEmoji = (emoji: string) => {
    const duration = Math.random() * 1 + 1 // Between 1s–2s
    const id = Date.now() + Math.random()
    fallingEmojis.value.push({
      id,
      char: emoji,
      x: Math.random() * 90,
      delay: 0,
      duration
    })
  
    setTimeout(() => {
      fallingEmojis.value = fallingEmojis.value.filter(e => e.id !== id)
    }, duration * 1000)
  }
  
  // Subscribe for real-time emojis
  onMounted(() => {
    emojiChannel
      .on('broadcast', { event: 'emoji' }, payload => {
        const { emoji } = payload.payload
        addEmoji(emoji)
      })
      .subscribe()
  })
  </script>
  
  <style scoped>
  @keyframes fall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
  
  .animate-fall {
    animation-name: fall;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
  </style>
  