'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

function formatDistance(totalInches) {
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}' ${inches}"`
}

export default function Leaderboard() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('shot_attempts')
      .select('player_id, distance_to_pin, is_hole_in_one, players(name)')
      .order('distance_to_pin', { ascending: true })

    if (error) { console.error(error); return }

    const best = {}
    const attempts = {}
    data.forEach((shot) => {
      attempts[shot.player_id] = (attempts[shot.player_id] || 0) + 1
      if (!best[shot.player_id] || shot.distance_to_pin < best[shot.player_id].distance_to_pin) {
        best[shot.player_id] = shot
      }
    })

    const ranked = Object.values(best)
      .sort((a, b) => a.distance_to_pin - b.distance_to_pin)
      .map(p => ({ ...p, attempts: attempts[p.player_id] || 1 }))

    setPlayers(ranked)
    setLoading(false)
    setLastUpdated(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [])

  const getRankLabel = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}`
  }

  const getRowStyle = (index) => {
    if (index === 0) return 'bg-yellow-500/10 border-l-4 border-yellow-500'
    if (index === 1) return 'bg-gray-400/5 border-l-4 border-gray-400'
    if (index === 2) return 'bg-orange-600/10 border-l-4 border-orange-500'
    if (index % 2 === 0) return 'bg-white/[0.02]'
    return 'bg-transparent'
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-gray-900 border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-gray-900 opacity-50"></div>
        <div className="relative max-w-3xl mx-auto px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse inline-block"></span>
            Live Rankings
          </div>
          <h1 className="text-4xl font-black text-white mb-1">Leaderboard</h1>
          <p className="text-gray-400">Million Dollar Mountain Challenge</p>
          {lastUpdated && <p className="text-gray-600 text-xs mt-1">Updated {lastUpdated} · Refreshes every 10s</p>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Qualifier progress */}
        {players.length > 0 && (
          <div className="mb-6 px-2">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold text-white">Top 20 Qualifier Spots</p>
              <p className="text-sm text-blue-400 font-bold">{Math.min(players.length, 20)}/20 filled</p>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((players.length / 20) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-gray-600 text-xs mt-1">Top 20 advance to the $1M finale</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-pulse">⛳</div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        )}

        {!loading && players.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏔️</div>
            <h2 className="text-2xl font-black text-white mb-2">No shots yet!</h2>
            <p className="text-gray-400 mb-6">Be the first to claim the top spot</p>
            <Link href="/register">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-8 rounded-xl transition-all">
                Enter Now →
              </button>
            </Link>
          </div>
        )}

        {players.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-gray-800">
            {/* Table header */}
            <div className="grid grid-cols-12 px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-widest font-bold">
              <div className="col-span-1 text-center">Pos</div>
              <div className="col-span-5 pl-2">Player</div>
              <div className="col-span-3 text-center">Best Shot</div>
              <div className="col-span-2 text-center">Attempts</div>
              <div className="col-span-1 text-center">Q</div>
            </div>

            {/* Rows */}
            {players.map((player, index) => (
              <div
                key={player.player_id}
                className={`grid grid-cols-12 px-4 py-3.5 items-center border-b border-gray-800/50 last:border-0 transition-all ${getRowStyle(index)}`}
              >
                <div className="col-span-1 text-center">
                  <span className={`font-black text-lg ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-500'}`}>
                    {getRankLabel(index)}
                  </span>
                </div>
                <div className="col-span-5 pl-2">
                  <p className={`font-bold text-base ${index < 3 ? 'text-white' : 'text-gray-200'}`}>
                    {player.players?.name}
                  </p>
                  {player.is_hole_in_one && (
                    <p className="text-cyan-400 text-xs font-bold">🕳️ Hole in One!</p>
                  )}
                </div>
                <div className="col-span-3 text-center">
                  <span className={`font-black text-lg ${index === 0 ? 'text-yellow-400' : index < 3 ? 'text-white' : 'text-blue-400'}`}>
                    {formatDistance(player.distance_to_pin)}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-gray-400 font-bold">{player.attempts}</span>
                </div>
                <div className="col-span-1 text-center">
                  {index < 20 ? (
                    <span className="text-green-400 font-black text-sm">✓</span>
                  ) : (
                    <span className="text-gray-600 text-sm">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {players.length > 0 && (
          <div className="mt-6 bg-blue-600/10 border border-blue-500/20 rounded-xl p-6 text-center">
            <p className="text-white font-black text-xl mb-1">Think you can beat them?</p>
            <p className="text-blue-300 text-sm mb-4">Top 20 advance to the $1M finale</p>
            <Link href="/register">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-8 rounded-xl transition-all w-full">
                🏌️ Enter Competition Now
              </button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}