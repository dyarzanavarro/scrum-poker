<!-- components/ParticipantList.vue -->
<template>
    <div>
      <div v-if="participants.length === 0" class="text-sm text-gray-500">
        No participants yet.
      </div>
  
      <ul class="divide-y">
        <li v-for="user in participants" :key="user.id" class="py-2 flex justify-between items-center">
  <span>{{ user.username }}</span>
  <span class="text-xs text-gray-400">
    <template v-if="estimates[user.id]?.revealed">
      🧠 {{ estimates[user.id].value }}
    </template>
    <template v-else>
      {{ estimates[user.id] ? '✅ Voted' : '⏳ Waiting' }}
    </template>
  </span>
</li>
      </ul>
    </div>
  </template>
  
  <script setup lang="ts">
  const supabase = useSupabaseClient()
  const props = defineProps<{ sessionId: string }>()
  
  const participants = ref<any[]>([])
const estimates = ref<Record<string, { value: string; revealed: boolean }>>({})
      
  const fetchParticipants = async () => {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', props.sessionId)
  
    if (data) participants.value = data
  }
  
  const fetchEstimates = async () => {
  const { data } = await supabase
    .from('estimates')
    .select('participant_id, value, revealed')
    .eq('session_id', props.sessionId)

  if (data) {
    estimates.value = {}
    for (const e of data) {
      estimates.value[e.participant_id] = { value: e.value, revealed: e.revealed }
    }
  }
}
  
  const hasVoted = (participantId: string) =>
    estimates.value.some(e => e.participant_id === participantId)
  
  // Subscribe to live updates
  onMounted(() => {
    fetchParticipants()
    fetchEstimates()
  
    supabase
      .channel(`room-${props.sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, fetchParticipants)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estimates' }, fetchEstimates)
      .subscribe()
  })
  </script>
  