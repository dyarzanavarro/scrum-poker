<template>
  <div class="grid grid-cols-4 gap-4 mt-6">
    <button
      v-for="value in values"
      :key="value"
      @click="submitVote(value)"
      :class="[
        'text-xl font-semibold py-6 rounded-lg border shadow transition',
        selected === value
          ? 'bg-black text-white border-black'
          : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
      ]"
    >
      {{ value }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sessionId: string
  participantId: string
}>()

const supabase = useSupabaseClient()
const selected = ref<string | null>(null)

const values = ['0', '0.5', '1', '2', '3', '5', '8', '13', '21', '?', '☕']

// Load previous vote if exists
onMounted(async () => {
  if (!props.participantId) return

  const { data } = await supabase
    .from('estimates')
    .select('value')
    .eq('session_id', props.sessionId)
    .eq('participant_id', props.participantId)
    .single()

  if (data?.value) selected.value = data.value
})

const submitVote = async (value: string) => {
  if (!props.participantId) return

  selected.value = value

  const { error } = await supabase
    .from('estimates')
    .upsert(
      {
        session_id: props.sessionId,
        participant_id: props.participantId,
        value
      },
      { onConflict: ['session_id', 'participant_id'] }
    )

  if (error) {
    console.error('Vote failed', error)
  }
}
</script>
