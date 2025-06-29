<template>
  <div>
 
    <!-- Hero -->
    <section class="py-24 px-6 text-center max-w-2xl mx-auto">
      <h2 class="text-4xl font-bold mb-4 tracking-tight">Agile Estimation, Simplified</h2>
      <p class="text-gray-600 text-lg mb-8">
        Create a real-time SCRUM Poker session. No signup needed — just fast, collaborative planning.
      </p>

      <div class="flex flex-col sm:flex-row justify-center gap-4 mb-6">
        <button
          @click="createSession"
          :disabled="loading"
          class="bg-black text-white font-semibold px-6 py-3 rounded-md hover:bg-gray-800 transition"
        >
          🚀 Start New Session
        </button>

        <input
          v-model="joinCode"
          placeholder="Enter session ID…"
          class="border border-gray-300 rounded-md px-4 py-3 w-full sm:w-64 text-sm focus:ring-2 focus:ring-black"
          @keyup.enter="joinByCode"
        />
      </div>

      <p class="text-xs text-gray-400">QR join support coming soon!</p>
    </section>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

const sessionName = ref('')
const loading = ref(false)
const joinCode = ref('')

const createSession = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('sessions')
    .insert([{ name: sessionName.value || null }])
    .select()
    .single()

  loading.value = false

  if (error || !data) {
    console.error('Failed to create session', error)
    return
  }

  router.push(`/session/${data.id}`)
}

const joinByCode = () => {
  if (!joinCode.value.trim()) return
  router.push(`/session/${joinCode.value.trim()}`)
}
</script>
