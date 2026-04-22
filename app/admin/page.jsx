'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const ADMIN_PIN = '1977'

export default function Admin() {
  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [shots, setShots] = useState([])
  const [editingShot, setEditingShot] = useState(null)
  const [editFeet, setEditFeet] = useState('')
  const [editInches, setEditInches] = useState('')

  const handlePin = (e) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setAuthenticated(true)
      fetchShots()
    } else {
      alert('Incorrect PIN.')
      setPin('')
    }
  }

  const fetchShots = async () => {
    const { data } = await supabase
      .from('shot_attempts')
      .select('id, distance_to_pin, is_hole_in_one, players(name)')
      .order('distance_to_pin', { ascending: true })
    setShots(data || [])
  }

  const formatDistance = (totalInches) => {
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return `${feet}' ${inches}"`
  }

  const handleReset = async () => {
    const confirmed = confirm('Are you sure you want to reset the leaderboard? This will delete ALL shot attempts.')
    if (!confirmed) return
    setLoading(true)
    const { error } = await supabase
      .from('shot_attempts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      setMessage('❌ Error resetting leaderboard.')
    } else {
      setMessage('✅ Leaderboard has been reset!')
      setShots([])
    }
    setLoading(false)
  }

  const handleEdit = (shot) => {
    setEditingShot(shot.id)
    setEditFeet(Math.floor(shot.distance_to_pin / 12).toString())
    setEditInches(Math.round(shot.distance_to_pin % 12).toString())
  }

  const handleSaveEdit = async (shotId) => {
    const totalInches = (parseFloat(editFeet) * 12) + parseFloat(editInches || 0)
    const { error } = await supabase
      .from('shot_attempts')
      .update({ distance_to_pin: totalInches })
      .eq('id', shotId)
    if (error) {
      setMessage('❌ Error updating shot.')
    } else {
      setMessage('✅ Shot updated!')
      setEditingShot(null)
      fetchShots()
    }
  }

  const handleDelete = async (shotId) => {
    const confirmed = confirm('Delete this shot?')
    if (!confirmed) return
    const { error } = await supabase
      .from('shot_attempts')
      .delete()
      .eq('id', shotId)
    if (error) {
      setMessage('❌ Error deleting shot.')
    } else {
      setMessage('✅ Shot deleted!')
      fetchShots()
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-4xl font-bold text-green-400 mb-2">🔒 Admin Access</h1>
          <p className="text-gray-400 mb-8">Enter your admin PIN to continue</p>
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-green-400 text-center mb-2">⚙️ Admin Panel</h1>
        <p className="text-gray-400 text-center mb-8">Million Dollar Mountain Challenge</p>

        {message && (
          <div className="bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-xl mb-6 text-center">
            {message}
          </div>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-2">🗑️ Reset Leaderboard</h2>
          <p className="text-gray-400 text-sm mb-4">Deletes all shot attempts. Use at the start of a new event.</p>
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl"
          >
            {loading ? 'Resetting...' : 'Reset Leaderboard'}
          </button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">✏️ Edit Shot Distances</h2>
          {shots.length === 0 && <p className="text-gray-400">No shots recorded yet.</p>}
          {shots.map((shot) => (
            <div key={shot.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
              <div>
                <p className="font-bold">{shot.players?.name}</p>
                <p className="text-gray-400 text-sm">{formatDistance(shot.distance_to_pin)}</p>
              </div>
              {editingShot === shot.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editFeet}
                    onChange={(e) => setEditFeet(e.target.value)}
                    placeholder="Ft"
                    className="w-16 bg-gray-700 text-white border border-gray-500 rounded px-2 py-1 text-center"
                  />
                  <input
                    type="number"
                    value={editInches}
                    onChange={(e) => setEditInches(e.target.value)}
                    placeholder="In"
                    className="w-16 bg-gray-700 text-white border border-gray-500 rounded px-2 py-1 text-center"
                  />
                  <button onClick={() => handleSaveEdit(shot.id)} className="bg-green-500 text-white px-3 py-1 rounded font-bold">Save</button>
                  <button onClick={() => setEditingShot(null)} className="bg-gray-600 text-white px-3 py-1 rounded">Cancel</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(shot)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-bold">Edit</button>
                  <button onClick={() => handleDelete(shot.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded font-bold">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}