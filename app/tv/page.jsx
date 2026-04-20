'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function TVDisplay() {
  const [players, setPlayers] = useState([])
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('shot_attempts')
      .select('player_id, distance_to_pin, is_hole_in_one, players(name)')
      .order('distance_to_pin', { ascending: true })

    if (error) return

    const best = {}
    data.forEach((shot) => {
      if (!best[shot.player_id] || shot.distance_to_pin < best[shot.player_id].distance_to_pin) {
        best[shot.player_id] = shot
      }
    })

    const ranked = Object.values(best).sort((a, b) => a.distance_to_pin - b.distance_to_pin)
    setPlayers(ranked)
    setLastUpdated(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 5000)
    return () => clearInterval(interval)
  }, [])

  const getMedal = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  return (
    <main className="min-h-screen bg-black text-white p-12 flex flex-col">
      <div className="text-center mb-10">
        <h1 className="text-7xl font-black text-green-400 mb-2">⛳ STADIUM CHALLENGE</h1>
        <p className="text-3xl text-gray-400">Mr Lucky's Golf — Closest to the Pin Wins</p>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full">
        {players.length === 0 && (
          <div className="text-center text-gray-500 mt-32">
            <p className="text-6xl mb-4">🏌️</p>
            <p className="text-4xl">Waiting for players...</p>
          </div>
        )}

        {players.slice(0, 10).map((player, index) => (
          <div
            key={player.player_id}
            className={`flex items-center justify-between px-8 py-6 mb-4 rounded-2xl ${
              index === 0
                ? 'bg-yellow-500 text-black'
                : index === 1
                ? 'bg-gray-400 text-black'
                : index === 2
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-white'
            }`}
          >
            <div className="flex items-center gap-6">
              <span className="text-5xl font-black w-16">{getMedal(index)}</span>
              <div>
                <p className="text-4xl font-black">{player.players?.name}</p>
                {player.is_hole_in_one && (
                  <p className="text-green-300 text-2xl font-bold">🕳️ HOLE IN ONE!</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-6xl font-black">{player.distance_to_pin}'</p>
              <p className="text-xl opacity-70">from pin</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-gray-600 text-xl mt-6">
        Last updated: {lastUpdated} · Refreshes every 5 seconds
      </div>
    </main>
  )
}