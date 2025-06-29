<template>
  <div class="mt-6 text-center">
    <button
      @click="revealVotes"
      :disabled="revealed || loading"
      class="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition disabled:opacity-50"
    >
      {{ revealed ? '✅ Votes Revealed' : 'Reveal Votes' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ sessionId: string }>()
const supabase = useSupabaseClient()

const revealed = ref(false)
const loading = ref(false)

const checkIfRevealed = async () => {
  const { data } = await supabase
    .from('estimates')
    .select('revealed')
    .eq('session_id', props.sessionId)
    .limit(1)

  revealed.value = !!data?.[0]?.revealed
}

const revealVotes = async () => {
  loading.value = true
  await supabase
    .from('estimates')
    .update({ revealed: true })
    .eq('session_id', props.sessionId)
  loading.value = false
  revealed.value = true
}

onMounted(checkIfRevealed)

supabase
  .channel(`reveal-${props.sessionId}`)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'estimates' }, checkIfRevealed)
  .subscribe()
</script>
