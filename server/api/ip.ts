// server/api/ip.ts
export default defineEventHandler(async (event) => {
    try {
        const res = await fetch('https://api64.ipify.org?format=json')
        const data = await res.json()
        return { ip: data.ip }
    } catch (e) {
        console.error('IP fetch failed:', e)
        return { ip: null }
    }
})
