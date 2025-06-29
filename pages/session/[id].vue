<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">SCRUM Poker Session</h1>

    <div v-if="session">
      <p class="text-sm text-gray-500 mb-6">Session ID: {{ session.id }}</p>

      <!-- Participants -->
      <div class="border p-4 rounded mb-4">
        <h2 class="font-semibold mb-2">Participants</h2>
        <ParticipantsList :session-id="session.id" />
      </div>

      <!-- Estimate Cards -->
      <EstimateGrid
        :session-id="session.id"
        :participant-id="participantId"
      />

      <!-- Reveal Button -->
      <RevealButton :session-id="session.id" />

      <!-- Estimate Summary -->
      <EstimateSummary :session-id="session.id" />
    </div>

    <!-- Join Modal -->
    <div
      v-if="showJoinModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 class="text-lg font-bold text-center">Enter your name to join</h2>
        <input
          v-model="username"
          placeholder="Your name…"
          class="w-full border border-gray-300 px-4 py-2 rounded"
        />
        <button
          @click="joinSession"
          class="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Join Session
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()

const sessionId = route.params.id as string
const session = ref<any>(null)
const participantId = ref<string | null>(null)
const username = ref('')
const showJoinModal = ref(false)

const SESSION_KEY = `scrum_poker_participant_${sessionId}`

// Load session data
onMounted(async () => {
  const { data, error } = await supabase
    .from('sessions')
    .select()
    .eq('id', sessionId)
    .single()

  if (error || !data) {
    console.error('Session not found', error)
    return
  }

  session.value = data

  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) {
    const { id, name } = JSON.parse(existing)
    participantId.value = id
    username.value = name
  } else {
    showJoinModal.value = true
  }
})

const joinSession = async () => {
  if (!username.value.trim()) return

  const { data, error } = await supabase
    .from('participants')
    .insert([{ session_id: sessionId, username: username.value }])
    .select()
    .single()

  if (!error && data) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: data.id, name: username.value })
    )
    participantId.value = data.id
    showJoinModal.value = false
  }
}

// Auto-reveal logic when all participants have voted
watchEffect(async () => {
  if (!session.value) return

  const { data: participants } = await supabase
    .from('participants')
    .select('id')
    .eq('session_id', sessionId)

  const { data: estimates } = await supabase
    .from('estimates')
    .select('participant_id')
    .eq('session_id', sessionId)

  const votesCount = new Set(estimates?.map(e => e.participant_id)).size
  const participantsCount = participants?.length || 0

  const allVoted = votesCount === participantsCount && participantsCount > 0

  if (allVoted) {
    const { data: alreadyRevealed } = await supabase
      .from('estimates')
      .select('revealed')
      .eq('session_id', sessionId)
      .limit(1)

    if (!alreadyRevealed?.[0]?.revealed) {
      await supabase
        .from('estimates')
        .update({ revealed: true })
        .eq('session_id', sessionId)
    }
  }
})
</script>
