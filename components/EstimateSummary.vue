<template>
  <div v-if="estimates.length && revealed" class="mt-6 border-t pt-4">
    <h3 class="font-semibold mb-2">Estimates Summary</h3>
    <ul class="mb-2">
      <li v-for="estimate in estimates" :key="estimate.id" class="text-sm text-gray-700">
        {{ estimate.username }}: {{ estimate.value }}
      </li>
    </ul>
    <p class="text-sm text-gray-500">Suggested value: <span class="font-semibold">{{ suggested }}</span></p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sessionId: string
  roundId: string
}>()

const supabase = useSupabaseClient()
const estimates = ref<any[]>([])
const revealed = ref(false)
const suggested = ref<string>('')

const calculateSuggested = (values: string[]) => {
  const numbers = values.map(v => parseFloat(v)).filter(n => !isNaN(n))
  if (!numbers.length) return ''

  const freqMap: Record<number, number> = {}
  numbers.forEach(n => { freqMap[n] = (freqMap[n] || 0) + 1 })
  const maxFreq = Math.max(...Object.values(freqMap))
  const modes = Object.entries(freqMap).filter(([, freq]) => freq === maxFreq).map(([val]) => Number(val))

  if (modes.length > 3) {
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length
    return avg.toFixed(1)
  }

  return modes.sort((a, b) => a - b)[0].toString()
}

const fetchEstimates = async () => {
  const { data: roundData } = await supabase
    .from('rounds')
    .select('revealed')
    .eq('id', props.roundId)
    .single()

  revealed.value = roundData?.revealed ?? false
  if (!revealed.value) return

  const { data: estimatesData } = await supabase
    .from('estimates')
    .select('value, participant_id, participants(username)')
    .eq('round_id', props.roundId)

  estimates.value = estimatesData?.map(e => ({
    id: e.participant_id,
    value: e.value,
    username: e.participants?.username ?? 'Anonymous'
  })) ?? []

  suggested.value = calculateSuggested(estimates.value.map(e => e.value))
}

onMounted(fetchEstimates)
watch(() => props.roundId, fetchEstimates)

supabase
  .channel(`estimates-summary-${props.roundId}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'estimates', filter: `round_id=eq.${props.roundId}` }, fetchEstimates)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds', filter: `id=eq.${props.roundId}` }, fetchEstimates)
  .subscribe()
</script>

<style scoped>
ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}
</style>
