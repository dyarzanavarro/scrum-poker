<template>
  <div class="grid grid-cols-4 sm:grid-cols-4 gap-4 mt-6">
    <button
      v-for="value in values"
      :key="value"
      @click="submitVote(value)"
      :class="[
        'transition-all duration-150 transform text-xl font-semibold py-6 rounded-md border shadow-sm focus:outline-none',
        'dark:bg-gray-950 dark:text-gray-200 dark:border-gray-700',
        'bg-white text-gray-900 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900',
        selected === value
          ? 'ring-2 ring-offset-2 ring-black dark:ring-white scale-105'
          : 'hover:scale-105'
      ]"
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
