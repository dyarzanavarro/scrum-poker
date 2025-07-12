<template>
  <div class="mt-6 flex flex-wrap gap-4">
    <button
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      @click="revealVotes"
      :disabled="round?.revealed"
    >
      {{ round?.revealed ? 'Votes Revealed' : 'Reveal Votes' }}
    </button>

    <button
      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      @click="nextRound"
    >
      ➕ Next Round
    </button>

    <button
      class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      @click="restartRound"
    >
      ♻️ Restart Round
    </button>
  </div>
</template>


<script setup lang="ts">
const props = defineProps<{
  sessionId: string
  roundId: string
  participantId: string
  isHost: boolean
}>()

const emit = defineEmits(['round-created', 'round-revealed'])
const supabase = useSupabaseClient()
const round = ref<any>(null)

const fetchRound = async () => {
  const { data } = await supabase
    .from('rounds')
    .select('*')
    .eq('id', props.roundId)
    .single()
  round.value = data
}

onMounted(fetchRound)
watch(() => props.roundId, fetchRound)

const revealVotes = async () => {
  await supabase
    .from('rounds')
    .update({ revealed: true })
    .eq('id', props.roundId)

  round.value.revealed = true
  emit('round-revealed')
}

const nextRound = async () => {
  const countRes = await supabase
    .from('rounds')
    .select('id', { count: 'exact' })
    .eq('session_id', props.sessionId)

  const newTitle = `Round ${countRes.count! + 1}`

  const { data: newRound } = await supabase
    .from('rounds')
    .insert([{ session_id: props.sessionId, title: newTitle }])
    .select()
    .single()

  if (newRound) emit('round-created')
}

const restartRound = async () => {
  await supabase.from('estimates').delete().eq('round_id', props.roundId)
  await supabase.from('rounds').update({ revealed: false }).eq('id', props.roundId)
  await fetchRound()
}


</script>
