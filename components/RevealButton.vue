<template>
  <button
    @click="revealVotes"
    class="cursor-pointer mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
    :disabled="revealed"
  >
    {{ revealed ? '✅ Votes Revealed' : '🔓 Reveal Votes' }}
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  sessionId: string
  roundId: string
}>()

const supabase = useSupabaseClient()
const revealed = ref(false)

const checkRevealed = async () => {
  const { data } = await supabase
    .from('estimates')
    .select('revealed')
    .eq('session_id', props.sessionId)
    .eq('round_id', props.roundId)
    .limit(1)

  revealed.value = !!data?.[0]?.revealed
}

const revealVotes = async () => {
  const { error } = await supabase
    .from('estimates')
    .update({ revealed: true })
    .eq('session_id', props.sessionId)
    .eq('round_id', props.roundId)

  if (!error) revealed.value = true
}

onMounted(checkRevealed)
</script>
