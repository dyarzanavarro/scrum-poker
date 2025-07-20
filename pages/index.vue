<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-200 flex flex-col justify-between">
    
    <!-- Hero -->
    <section class="py-24 px-6 text-center max-w-2xl mx-auto">
      <h1 class="text-5xl font-extrabold mb-4 tracking-tight leading-tight">
        Agile Estimation <span class="underline decoration-wavy">Simplified</span>
      </h1>
      <p class="text-gray-600 dark:text-gray-400 text-lg mb-8">
        Create a real-time SCRUM Poker session. No signup needed — just fast, collaborative planning.
      </p>

      <div class="flex flex-col sm:flex-row justify-center gap-4 mb-6">
        <button
          @click="createSessionWithRound"
          :disabled="loading"
          class="px-6 py-3 rounded-md font-semibold text-white bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 transition hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🚀 Start New Session
        </button>

        <input
          v-model="joinCode"
          placeholder="Enter session ID…"
          class="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 w-full sm:w-64 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400"
          @keyup.enter="joinByCode"
        />
      </div>
    </section>

    <!-- How It Works -->
    <section class="text-center px-6 pb-16">
      <h3 class="text-xl font-semibold mb-4">How it works</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-sm text-gray-600 dark:text-gray-300">
        <div>✅ Start a session — no signup needed</div>
        <div>👥 Invite teammates with a link or QR code</div>
        <div>📊 Vote, reveal, and estimate in real-time</div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

const loading = ref(false)
const joinCode = ref('')


const createSessionWithRound = async () => {
  loading.value = true

  try {
    // 1. Get Turnstile token from widget
    if (process.env.NODE_ENV === 'production') {
      const turnstileToken = (window as any).turnstile?.getResponse()
      if (!turnstileToken) {
        alert("Please complete the CAPTCHA.")
        loading.value = false
        return
      }
    }

    // 2. Get client IP
    const ipRes = await fetch("https://api.ipify.org?format=json")
    const ipData = await ipRes.json()
    const ip = ipData?.ip || null

    // 3. Insert session with IP
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert([{ name: null, ip_address: ip }])
      .select()
      .single()

    if (sessionError || !session) {
      console.error("❌ Failed to create session", sessionError)
      alert("Failed to create session.")
      loading.value = false
      return
    }

    // 4. Insert first round
    const { error: roundError } = await supabase.from("rounds").insert([
      { session_id: session.id, title: "Round 1" }
    ])
    if (roundError) {
      console.error("⚠️ Failed to create round", roundError)
    }

    // 5. Insert host participant
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .insert([{ session_id: session.id, username: "Host", is_host: true }])
      .select()
      .single()

    if (participantError || !participant) {
      console.error("⚠️ Failed to create host participant", participantError)
    } else {
      localStorage.setItem(
        `scrum_poker_participant_${session.id}`,
        JSON.stringify({ id: participant.id, name: "Host", is_host: true })
      )
    }

    router.push(`/session/${session.id}`)
  } catch (err) {
    console.error("Unexpected error", err)
    alert("Something went wrong.")
  } finally {
    loading.value = false
  }
}

const joinByCode = () => {
  if (!joinCode.value.trim()) return
  router.push(`/session/${joinCode.value.trim()}`)
}

const joinDemo = () => {
  router.push(`/session/demo`)
}
</script>
