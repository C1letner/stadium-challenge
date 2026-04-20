'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const STAFF_PIN = '1234'

export default function ShotEntry() {
  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [players, setPlayers] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [distance, setDistance] = useState('')
  const [isHoleInOne, setIsHoleInOne] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (authenticated) {
      const fetchPlayers = async () => {
        const { data } = await supabase
          .from('players')
          .select('id, name')
          .order('name')
        setPlayers(data || [])
      }
      fetchPlayers()
    }
  }, [authenticated])

  const handlePin = (e) => {
    e.preventDefault()
    if (pin === STAFF_PIN) {
      setAuthenticated(true)
    } else {
      alert('Incorrect PIN. Please try again.')
      setPin('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const { error } = await supabase
      .from('shot_attempts')
      .insert([{
        player_id: selectedPlayer,
        distance_to_pin: parseFloat(distance),
        is_hole_in_one: isHoleInOne,
        attempt_number: 1
      }])

    if (error) {
      alert('Something went wrong. Please try again.')
      console.error(error)
    } else {
      setSuccess(true)
      setDistance('')
      setIsHoleInOne(false)
      setSelectedPlayer('')
    }
    setLoading(false)
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-4xl font-bold text-green-400 mb-2">🔒 Staff Access</h1>
          <p className="text-gray-400 mb-8">Enter your staff PIN to continue</p>
          <form onSubmit={handlePin} className="flex flex-col gap-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:border-green-400"
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-400 text-white text-xl font-bold py-4 px-8 rounded-xl"
            >
              Enter
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-green-400 text-center mb-2">🎯 Shot Entry</h1>
        <p className="text-gray-400 text-center mb-8">Staff use only — record player shots</p>

        {success && (
          <div className="bg-green-800 border border-green-500 text-green-200 px-4 py-3 rounded-xl mb-6 text-center">
            ✅ Shot recorded! Leaderboard updated.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Select Player</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              required
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-400"
            >
              <option value="">-- Choose a player --</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Distance to Pin</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                required
                min="0"
                placeholder="Feet"
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3">
            <input
              type="checkbox"
              id="hio"
              checked={isHoleInOne}
              onChange={(e) => setIsHoleInOne(e.target.checked)}
              className="w-5 h-5 accent-green-400"
            />
            <label htmlFor="hio" className="text-white text-lg">🕳️ Hole in One!</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white text-xl font-bold py-4 px-8 rounded-xl mt-2"
          >
            {loading ? 'Saving...' : 'Record Shot'}
          </button>
        </form>
      </div>
    </main>
  )
}