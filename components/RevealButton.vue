<template>
    <div class="mt-6 text-center">
      <UButton
        color="primary"
        @click="revealVotes"
        :disabled="revealed || loading"
        :loading="loading"
      >
        {{ revealed ? 'Votes Revealed' : 'Reveal Votes' }}
      </UButton>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
    sessionId: string
  }>()
  
  const supabase = useSupabaseClient()
  const loading = ref(false)
  const revealed = ref(false)
  
  const checkIfRevealed = async () => {
    const { data } = await supabase
      .from('estimates')
      .select('revealed')
      .eq('session_id', props.sessionId)
      .limit(1)
  
    if (data?.length) {
      revealed.value = data[0].revealed === true
    }
  }
  
  const revealVotes = async () => {
    loading.value = true
    const { error } = await supabase
      .from('estimates')
      .update({ revealed: true })
      .eq('session_id', props.sessionId)
  
    loading.value = false
    if (!error) revealed.value = true
  }
  
  onMounted(checkIfRevealed)
  
  supabase
    .channel(`reveals-${props.sessionId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'estimates' }, checkIfRevealed)
    .subscribe()
  </script>
  