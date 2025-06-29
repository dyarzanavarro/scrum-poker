<template>
    <div v-if="revealed && votes.length" class="mt-10 border-t pt-6">
      <h2 class="text-lg font-bold mb-4 text-center">🧠 Estimation Summary</h2>
  
      <div class="mb-4 flex flex-wrap justify-center gap-2">
        <span
          v-for="(v, i) in votes"
          :key="i"
          class="px-3 py-1 border rounded text-sm bg-gray-100 text-gray-800"
        >
          {{ v }}
        </span>
      </div>
  
      <div class="text-center text-gray-700 space-y-1 text-sm">
        <p><strong>Average:</strong> {{ average }}</p>
        <p><strong>Median:</strong> {{ median }}</p>
        <p><strong>Suggested Estimate:</strong> {{ mode }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{ sessionId: string }>()
  
  const supabase = useSupabaseClient()
  const votes = ref<string[]>([])
  const revealed = ref(false)
  
  const fetchVotes = async () => {
    const { data } = await supabase
      .from('estimates')
      .select('value, revealed')
      .eq('session_id', props.sessionId)
  
    const validVotes = data?.filter(e => e.revealed && !isNaN(parseFloat(e.value))) || []
    votes.value = validVotes.map(v => v.value)
    revealed.value = validVotes.length > 0
  }
  
  onMounted(fetchVotes)
  
  // Update in realtime or when rerendered
  watchEffect(() => {
    fetchVotes()
  })
  
  // Helpers
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
    const counts: Record<number, number> = {}
    numericVotes.value.forEach(v => {
      counts[v] = (counts[v] || 0) + 1
    })
    const max = Math.max(...Object.values(counts))
    const mostFrequent = Object.entries(counts).find(([_, count]) => count === max)
    return mostFrequent?.[0] ?? '-'
  })
  </script>
  