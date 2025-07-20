<template>
  <div class="grid grid-cols-4 gap-4 mt-6">
    <button
      v-for="value in values"
      :key="value"
      :class="[
        'transition-all duration-150 transform text-xl py-6 border rounded',
        selected === value
          ? 'scale-105 bg-black text-white shadow-lg'
          : 'hover:scale-105 bg-white hover:bg-gray-100'
      ]"
      @click="submitVote(value)"
    >
      {{ value }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sessionId: string
  roundId: string
  participantId: string
}>()

const supabase = useSupabaseClient()
const selected = ref<string | null>(null)

const values = ['0', '0.5', '1', '2', '3', '5', '8', '13', '21', '?', '☕']

onMounted(async () => {
  const { data } = await supabase
    .from('estimates')
    .select('value')
    .eq('session_id', props.sessionId)
    .eq('round_id', props.roundId)
    .eq('participant_id', props.participantId)
    .maybeSingle()

  if (data?.value) selected.value = data.value
})

const submitVote = async (value: string) => {
  selected.value = value

  const { error } = await supabase
    .from('estimates')
    .upsert(
      {
        session_id: props.sessionId,
        round_id: props.roundId,
        participant_id: props.participantId,
        value,
        revealed: false
      },
      { onConflict: ['session_id', 'round_id', 'participant_id'] }
    )

  if (error) {
    console.error('Vote failed', error)
  }
}
</script>
