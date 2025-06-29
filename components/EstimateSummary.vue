<template>
    <div v-if="revealed && votes.length" class="mt-8 border-t pt-6">
      <h2 class="text-lg font-bold mb-4">🧠 Estimation Results</h2>
  
      <div class="mb-2 text-gray-700">
        <strong>Votes:</strong>
        <span v-for="(v, i) in votes" :key="i" class="inline-block mx-1 px-2 py-1 border rounded text-sm">
          {{ v }}
        </span>
      </div>
  
      <p class="text-gray-600 text-sm">
        <span>Average: <strong>{{ average }}</strong></span> |
        <span>Median: <strong>{{ median }}</strong></span> |
        <span>Suggested Estimate: <strong>{{ mode }}</strong></span>
      </p>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
    sessionId: string
  }>()
  
  const supabase = useSupabaseClient()
  const votes = ref<string[]>([])
  const revealed = ref(false)
  
  // Fetch votes after revealed
  onMounted(async () => {
    const { data } = await supabase
      .from('estimates')
      .select('value, revealed')
      .eq('session_id', props.sessionId)
  
    if (!data?.length) return
  
    const validVotes = data.filter(e => e.revealed && !isNaN(parseFloat(e.value)))
    votes.value = validVotes.map(v => v.value)
    revealed.value = validVotes.length > 0
  })
  
  // Numeric-only helper
  const numericVotes = computed(() => votes.value.map(v => parseFloat(v)).filter(v => !isNaN(v)))
  
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
    numericVotes.value.forEach(v => freq[v] = (freq[v] || 0) + 1)
    const max = Math.max(...Object.values(freq))
    const mostFrequent = Object.keys(freq).find(key => freq[+key] === max)
    return mostFrequent
  })
  </script>
  