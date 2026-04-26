'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'

function formatDistance(totalInches) {
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}' ${inches}"`
}

export default function TVDisplay() {
  const [players, setPlayers] = useState([])
  const [lastUpdated, setLastUpdated] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('shot_attempts')
      .select('player_id, distance_to_pin, is_hole_in_one, players(name)')
      .order('distance_to_pin', { ascending: true })

    if (error) return

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
    setLastUpdated(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 5000)
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 1000)
    return () => { clearInterval(interval); clearInterval(clockInterval) }
  }, [])

  const getRowStyle = (index) => {
    if (index === 0) return 'bg-yellow-500/15 border-l-4 border-yellow-400'
    if (index === 1) return 'bg-gray-400/10 border-l-4 border-gray-300'
    if (index === 2) return 'bg-orange-600/10 border-l-4 border-orange-400'
    if (index % 2 === 0) return 'bg-white/[0.02]'
    return ''
  }

  const getDistanceColor = (index) => {
    if (index === 0) return 'text-yellow-400'
    if (index === 1) return 'text-gray-300'
    if (index === 2) return 'text-orange-400'
    return 'text-blue-400'
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/LUCKYS LOGO UPDATED.png"
            alt="Mr Lucky's Golf"
            width={60}
            height={60}
            className="rounded-xl"
          />
          <div>
            <p className="text-white font-black text-2xl tracking-wide">MR LUCKY'S GOLF</p>
            <p className="text-blue-400 text-sm font-bold tracking-widest uppercase">Million Dollar Mountain Challenge</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-bold px-4 py-1.5 rounded-full mb-1">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse inline-block"></span>
            LIVE
          </div>
          <p className="text-gray-400 text-sm">{currentTime}</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 px-10 py-6 flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-700 text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
          <div className="col-span-1 text-center">Pos</div>
          <div className="col-span-5 pl-2">Player</div>
          <div className="col-span-3 text-right">Best Shot</div>
          <div className="col-span-2 text-center">Shots</div>
          <div className="col-span-1 text-center">Q</div>
        </div>

        {players.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-6xl mb-4">🏔️</p>
            <p className="text-3xl font-black text-white mb-2">Waiting for players...</p>
            <p className="text-gray-500">Shots will appear here in real time</p>
          </div>
        )}

        {/* Player rows */}
        <div className="flex flex-col gap-1">
          {players.slice(0, 12).map((player, index) => (
            <div
              key={player.player_id}
              className={`grid grid-cols-12 px-6 py-4 items-center rounded-lg ${getRowStyle(index)}`}
            >
              <div className="col-span-1 text-center">
                <span className={`font-black text-3xl ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-500'}`}>
                  {index + 1}
                </span>
              </div>
              <div className="col-span-5 pl-2">
                <p className="font-black text-2xl text-white uppercase tracking-wide">
                  {player.players?.name}
                </p>
                {player.is_hole_in_one && (
                  <p className="text-cyan-400 text-sm font-bold tracking-wide">🕳️ HOLE IN ONE</p>
                )}
                {index < 20 && (
                  <p className="text-blue-400/60 text-xs font-bold tracking-widest uppercase">✓ Qualifier</p>
                )}
              </div>
              <div className="col-span-3 text-right">
                <span className={`font-black text-4xl ${getDistanceColor(index)}`}>
                  {formatDistance(player.distance_to_pin)}
                </span>
                <p className="text-gray-600 text-xs uppercase tracking-widest">from pin</p>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-gray-400 text-2xl font-bold">{player.attempts}</span>
              </div>
              <div className="col-span-1 text-center">
                {index < 20 ? (
                  <span className="text-green-400 font-black text-xl">✓</span>
                ) : (
                  <span className="text-gray-700 text-xl">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-yellow-400 font-black text-xl">$1,000,000</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Prize Pool</p>
          </div>
          <div className="w-px h-8 bg-gray-700"></div>
          <div className="text-center">
            <p className="text-blue-400 font-black text-xl">{Math.min(players.length, 20)}/20</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Qualifier Spots</p>
          </div>
          <div className="w-px h-8 bg-gray-700"></div>
          <div className="text-center">
            <p className="text-white font-black text-xl">{players.length}</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Total Players</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-600 text-xs uppercase tracking-widest">Updates every 5 seconds · {lastUpdated}</p>
          <p className="text-gray-700 text-xs">mrluckysgolf.com</p>
        </div>
      </div>
    </main>
  )
}