<template>
  <div class="relative">
    <!-- Estimation Summary -->
    <div v-if="revealed && votes.length" class="mt-8 border-t pt-6">
      <h2 class="text-lg font-bold mb-4">🧠 Estimation Results</h2>

      <div class="mb-2 text-gray-700">
        <strong>Votes:</strong>
        <span
          v-for="(v, i) in votes"
          :key="i"
          class="inline-block mx-1 px-2 py-1 border rounded text-sm opacity-0 animate-fade-in"
          :style="{ animationDelay: `${i * 0.1}s` }"
        >
          {{ v }}
        </span>
      </div>

      <p class="text-gray-600 text-sm">
        <span>Average: <strong>{{ average }}</strong></span> |
        <span>Median: <strong>{{ median }}</strong></span> |
        <span>Suggested Estimate: <strong>{{ mode }}</strong></span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sessionId: string
  roundId: string
}>()

const supabase = useSupabaseClient()
const votes = ref<string[]>([])
const revealed = ref(false)

// Load once, and on round changes
onMounted(fetchVotes)

supabase
  .channel(`rounds-${props.roundId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'rounds',
    filter: `id=eq.${props.roundId}`
  }, fetchVotes)
  .subscribe()

async function fetchVotes() {
  const roundRes = await supabase
    .from('rounds')
    .select('revealed')
    .eq('id', props.roundId)
    .single()

  revealed.value = !!roundRes.data?.revealed

  if (!revealed.value) {
    votes.value = []
    return
  }

  const { data } = await supabase
    .from('estimates')
    .select('value')
    .eq('session_id', props.sessionId)
    .eq('round_id', props.roundId)
    .eq('revealed', true)

  const validVotes = data?.filter(e => !isNaN(parseFloat(e.value))) || []
  votes.value = validVotes.map(v => v.value)
}

const numericVotes = computed(() =>
  votes.value.map(v => parseFloat(v)).filter(v => !isNaN(v))
)

const average = computed(() => {
  if (!numericVotes.value.length) return '-'
  const sum = numericVotes.value.reduce((a, b) => a + b, 0)
  return (sum / numericVotes.value.length).toFixed(1)
})

const median = computed(() => {
  if (!numericVotes.value.length) return '-'
  const sorted = [...numericVotes.value].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1)
    : sorted[mid].toString()
})

const mode = computed(() => {
  if (!numericVotes.value.length) return '-'

  const freq: Record<number, number> = {}
  numericVotes.value.forEach(v => {
    freq[v] = (freq[v] || 0) + 1
  })

  const maxFreq = Math.max(...Object.values(freq))
  const mostFrequent = Object.keys(freq)
    .filter(key => freq[+key] === maxFreq)
    .map(Number)

  return Math.max(...mostFrequent).toString()
})
</script>
