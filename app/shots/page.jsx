'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const STAFF_PIN = '1977'

export default function ShotEntry() {
  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [players, setPlayers] = useState([])
  const [shotPlayerIds, setShotPlayerIds] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [search, setSearch] = useState('')
  const [feet, setFeet] = useState('')
  const [inches, setInches] = useState('')
  const [isHoleInOne, setIsHoleInOne] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (authenticated) {
      fetchPlayers()
      fetchShotPlayerIds()
    }
  }, [authenticated])

  const fetchPlayers = async () => {
    const { data } = await supabase.from('players').select('id, name').order('name')
    setPlayers(data || [])
  }

  const fetchShotPlayerIds = async () => {
    const { data } = await supabase.from('shot_attempts').select('player_id')
    const ids = [...new Set(data?.map(s => s.player_id) || [])]
    setShotPlayerIds(ids)
  }

  const handlePin = (e) => {
    e.preventDefault()
    if (pin === STAFF_PIN) {
      setAuthenticated(true)
    } else {
      alert('Incorrect PIN.')
      setPin('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    const totalInches = (parseFloat(feet) * 12) + parseFloat(inches || 0)
    const { error } = await supabase.from('shot_attempts').insert([{
      player_id: selectedPlayer,
      distance_to_pin: totalInches,
      is_hole_in_one: isHoleInOne,
      attempt_number: 1
    }])
    if (error) {
      alert('Something went wrong.')
    } else {
      setSuccess(true)
      setFeet('')
      setInches('')
      setIsHoleInOne(false)
      setSelectedPlayer('')
      setSearch('')
      fetchShotPlayerIds()
    }
    setLoading(false)
  }

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Staff Access</h1>
            <p className="text-gray-500">Enter your PIN to continue</p>
          </div>
          <form onSubmit={handlePin} className="flex flex-col gap-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-4 text-center text-2xl tracking-widest outline-none transition-colors"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all">
              Enter
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="relative overflow-hidden bg-gray-900 border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-gray-900 opacity-50"></div>
        <div className="relative max-w-lg mx-auto px-6 py-8 text-center">
          <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
            Staff Only
          </div>
          <h1 className="text-3xl font-black text-white mb-1">🎯 Shot Entry</h1>
          <p className="text-gray-400">Record player shots for the leaderboard</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        {success && (
          <div className="bg-green-600/10 border border-green-500/30 text-green-400 px-4 py-4 rounded-xl mb-6 text-center font-bold">
            ✅ Shot recorded! Leaderboard updated.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Search & Select Player</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedPlayer('') }}
              placeholder="🔍 Type to search players..."
              className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors mb-2"
            />
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              required
              className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors"
            >
              <option value="">— Choose a player —</option>
              {filteredPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {shotPlayerIds.includes(p.id) ? '🟢 ' : '⚪ '}{p.name}
                </option>
              ))}
            </select>
            <p className="text-gray-600 text-xs mt-1">🟢 = shot recorded &nbsp; ⚪ = no shot yet · {filteredPlayers.length} players shown</p>
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Distance to Pin</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  required
                  min="0"
                  placeholder="0"
                  className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors text-center text-xl font-black"
                />
                <p className="text-gray-500 text-xs text-center mt-1 uppercase tracking-wide">Feet</p>
              </div>
              <div>
                <input
                  type="number"
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  min="0"
                  max="11"
                  placeholder="0"
                  className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors text-center text-xl font-black"
                />
                <p className="text-gray-500 text-xs text-center mt-1 uppercase tracking-wide">Inches</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setIsHoleInOne(!isHoleInOne)}
            className={`cursor-pointer border-2 rounded-xl px-5 py-4 flex items-center justify-between transition-all ${
              isHoleInOne ? 'border-cyan-500 bg-cyan-600/10' : 'border-gray-700 bg-gray-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕳️</span>
              <div>
                <p className="font-black text-white">Hole in One!</p>
                <p className="text-gray-500 text-sm">Tap to mark</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isHoleInOne ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600'
            }`}>
              {isHoleInOne && <span className="text-white text-xs font-black">✓</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-black py-4 rounded-xl transition-all text-lg"
          >
            {loading ? 'Saving...' : 'Record Shot →'}
          </button>
        </form>
      </div>
    </main>
  )
}