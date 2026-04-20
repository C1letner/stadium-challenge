'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Leaderboard() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('shot_attempts')
      .select('player_id, distance_to_pin, is_hole_in_one, players(name)')
      .order('distance_to_pin', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    // Get best shot per player
    const best = {}
    data.forEach((shot) => {
      if (!best[shot.player_id] || shot.distance_to_pin < best[shot.player_id].distance_to_pin) {
        best[shot.player_id] = shot
      }
    })

    const ranked = Object.values(best).sort((a, b) => a.distance_to_pin - b.distance_to_pin)
    setPlayers(ranked)
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [])

  const getMedal = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-green-400 text-center mb-2">⛳ Leaderboard</h1>
        <p className="text-gray-400 text-center mb-8">Closest to the pin wins — updates every 10 seconds</p>

        {loading && <p className="text-center text-gray-400">Loading...</p>}

        {!loading && players.length === 0 && (
          <div className="text-center text-gray-400 mt-16">
            <p className="text-6xl mb-4">🏌️</p>
            <p className="text-xl">No shots recorded yet. Let the games begin!</p>
          </div>
        )}

        {players.map((player, index) => (
          <div
            key={player.player_id}
            className={`flex items-center justify-between p-4 mb-3 rounded-xl border ${
              index === 0
                ? 'bg-yellow-900 border-yellow-500'
                : index === 1
                ? 'bg-gray-700 border-gray-400'
                : index === 2
                ? 'bg-orange-900 border-orange-500'
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold w-10">{getMedal(index)}</span>
              <div>
                <p className="text-lg font-bold">{player.players?.name}</p>
                {player.is_hole_in_one && (
                  <span className="text-green-400 text-sm font-bold">🕳️ HOLE IN ONE!</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                {player.distance_to_pin}'
              </p>
              <p className="text-gray-400 text-sm">from pin</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}