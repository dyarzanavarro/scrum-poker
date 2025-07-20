<template>
  <div class="min-h-screen p-4 max-w-3xl mx-auto bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200">

    <h1 class="text-xl font-bold mb-4">SCRUM Poker Session</h1>

    <div v-if="session && currentRound">
      <!-- Session Info -->
      <div class="flex items-center justify-between mb-4 gap-4">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Session ID:</p>
          <div class="flex items-center gap-2">
            <p class="font-mono text-sm cursor-pointer" @click="copySessionLink">{{ session.id }}</p>
            <button @click="copySessionLink" class="text-xs text-blue-600 hover:underline">📋 Copy</button>
          </div>
        </div>
        <QRCodeInline class="cursor-pointer" @click="copySessionLink" :session-id="session.id" />
      </div>

      <!-- Participants -->
      <div class="border border-gray-200 dark:border-gray-700 p-4 rounded mb-4">
        <h2 class="font-semibold mb-2">Participants</h2>
        <ParticipantsList :session-id="session.id" :round-id="currentRound.id" :key="refreshKey" />
      </div>

      <!-- Current Round Title -->
      <div class="mb-4">
        <label class="text-sm text-gray-500 dark:text-gray-400 block mb-1">Current Story</label>

        <div v-if="isHost" class="flex gap-2 items-center">
          <input
            v-model="roundTitle"
            class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 px-2 py-1 rounded w-64"
          />
          <button
            @click="saveRoundTitle"
            class="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            💾 Save
          </button>
        </div>

        <div class="text-sm italic text-gray-800 dark:text-gray-300 mt-2">
          Estimating:
          <template v-if="jiraLink">
            <a :href="jiraLink" target="_blank" class="text-blue-600 hover:underline">
              {{ currentRound?.title }}
            </a>
          </template>
          <template v-else>
            {{ currentRound?.title || 'Untitled Round' }}
          </template>
        </div>
      </div>

      <!-- Voting Grid -->
      <EstimateGrid
        :session-id="session.id"
        :round-id="currentRound.id"
        :participant-id="participantId ?? ''"
        :key="refreshKey"
      />

      <!-- Estimation Results -->
      <EstimateSummary
        :session-id="session.id"
        :round-id="currentRound.id"
        :participant-id="participantId ?? ''"
        :key="refreshKey"
      />

      <!-- Host Controls -->
      <RoundControls
        v-if="isHost"
        :session-id="session.id"
        :round-id="currentRound.id"
        :participant-id="participantId"
        :is-host="isHost"
        @round-created="handleRoundCreated"
        @round-revealed="handleRoundRevealed"
      />

      <!-- Emoji Fun Corner -->
      <ADHDCorner />
    </div>

    <!-- Join Modal -->
    <div v-if="showJoinModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 class="text-lg font-bold text-center">Enter your name to join</h2>
        <input
          v-model="username"
          placeholder="Your name…"
          class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded"
        />
        <button
          @click="joinSession"
          class="w-full bg-black text-white py-2 rounded hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500"
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
const currentRound = ref<any>(null)
const participantId = ref<string | null>(null)
const username = ref('')
const isHost = ref(false)
const showJoinModal = ref(false)
const refreshKey = ref(0)
const roundTitle = ref('')

const SESSION_KEY = `scrum_poker_participant_${sessionId}`

onMounted(async () => {
  // Load session
  const { data: sessionData } = await supabase
    .from('sessions')
    .select()
    .eq('id', sessionId)
    .single()

  session.value = sessionData

  // Load latest round
  await fetchLatestRound()

  // Subscribe to new rounds
  supabase.channel('realtime-rounds')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'rounds',
      filter: `session_id=eq.${sessionId}`
    }, handleRoundCreated)
    .subscribe()

  // Check for existing participant
  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) {
    const parsed = JSON.parse(existing)
    participantId.value = parsed.id
    username.value = parsed.name
    isHost.value = !!parsed.is_host
  } else {
    showJoinModal.value = true
  }
})

const fetchLatestRound = async () => {
  const roundRes = await supabase
    .from('rounds')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  currentRound.value = roundRes.data
  roundTitle.value = roundRes.data?.title || ''
}

const handleRoundCreated = async () => {
  await fetchLatestRound()
  refreshKey.value++
}

const handleRoundRevealed = async () => {
  await fetchLatestRound()
  refreshKey.value++
}

const saveRoundTitle = async () => {
  if (!roundTitle.value.trim() || !currentRound.value?.id) return

  const { error } = await supabase
    .from('rounds')
    .update({ title: roundTitle.value })
    .eq('id', currentRound.value.id)

  if (error) {
    console.error('❌ Failed to save round title', error)
  } else {
    console.log('✅ Round title saved')
    await fetchLatestRound()
  }
}
const joinSession = async () => {
  if (!username.value.trim()) return

  const { count } = await supabase
    .from('participants')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)

  const isFirst = (count || 0) === 0

  const { data, error } = await supabase
    .from('participants')
    .insert([{ session_id: sessionId, username: username.value, is_host: isFirst }])
    .select()
    .single()

  if (!error && data) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: data.id, name: username.value, is_host: isFirst })
    )
    participantId.value = data.id
    isHost.value = isFirst
    showJoinModal.value = false
    refreshKey.value++
  } else {
    console.error('❌ Failed to join session', error)
  }
}

const copySessionLink = async () => {
  if (!session.value?.id) return
  const link = `${window.location.origin}/session/${session.value.id}`
  try {
    await navigator.clipboard.writeText(link)
  } catch (e) {
    console.error('Failed to copy', e)
    alert('❌ Could not copy link')
  }
}

const jiraLink = computed(() => {
  const match = currentRound.value?.title?.match(/^([A-Z]+-\d+)/)
  if (!match) return null
  const ticket = match[1]
  return `https://flankerbrands.atlassian.net/browse/${ticket}`
})
</script>
