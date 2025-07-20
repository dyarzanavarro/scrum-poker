<template>
  <div>
    <div v-if="participants.length === 0" class="text-sm text-gray-500">No participants yet.</div>
    <transition-group name="list" tag="ul" class="divide-y">
      <li
        v-for="user in participants"
        :key="user.id"
        class="py-2 flex justify-between items-center"
      >
        <span :class="user.id === currentUserId ? 'font-semibold' : ''">
          {{ user.username }}
        </span>
        <span class="text-xs text-gray-400">
          <template v-if="revealed && estimates[user.id]">
            🧀 {{ estimates[user.id].value }}
          </template>
          <template v-else>
            {{ estimates[user.id] ? '✅ Voted' : '⏳ Waiting' }}
          </template>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sessionId: string
  roundId: string
}>()

const supabase = useSupabaseClient()
const participants = ref<any[]>([])
const estimates = reactive<Record<string, { value: string }>>({})
const revealed = ref(false)
const currentUserId = ref<string | null>(null)

const fetchParticipants = async () => {
  const { data } = await supabase
    .from('participants')
    .select('*')
    .eq('session_id', props.sessionId)
  if (data) participants.value = data
}

const fetchEstimates = async () => {
  const { data: roundData } = await supabase
    .from('rounds')
    .select('revealed')
    .eq('id', props.roundId)
    .maybeSingle()

  revealed.value = roundData?.revealed ?? false

  const { data } = await supabase
    .from('estimates')
    .select('participant_id, value')
    .eq('session_id', props.sessionId)
    .eq('round_id', props.roundId)

  // Reactive clear + repopulate
  Object.keys(estimates).forEach(key => delete estimates[key])
  data?.forEach(e => {
    estimates[e.participant_id] = { value: e.value }
  })
}

onMounted(() => {
  const key = `scrum_poker_participant_${props.sessionId}`
  const local = localStorage.getItem(key)
  if (local) currentUserId.value = JSON.parse(local).id

  fetchParticipants()
  fetchEstimates()

  channel = supabase
    .channel(`participants-${props.sessionId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'participants',
      filter: `session_id=eq.${props.sessionId}`
    }, fetchParticipants)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'estimates',
      filter: `round_id=eq.${props.roundId}`
    }, fetchEstimates)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'rounds',
      filter: `id=eq.${props.roundId}`
    }, fetchEstimates)
    .subscribe()
})

watch(() => props.roundId, () => {
  fetchParticipants()
  fetchEstimates()
})

let channel: any = null
onBeforeUnmount(() => {
  if (channel) supabase.removeChannel(channel)
})
</script>
