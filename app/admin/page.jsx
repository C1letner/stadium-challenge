'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const ADMIN_PIN = '1977'

export default function Admin() {
  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
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

  const showMessage = (msg, type = 'success') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
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
      showMessage('❌ Error resetting leaderboard.', 'error')
    } else {
      showMessage('✅ Leaderboard has been reset!')
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
      showMessage('❌ Error updating shot.', 'error')
    } else {
      showMessage('✅ Shot updated!')
      setEditingShot(null)
      fetchShots()
    }
  }

  const handleDelete = async (shotId) => {
    const confirmed = confirm('Delete this shot?')
    if (!confirmed) return
    const { error } = await supabase.from('shot_attempts').delete().eq('id', shotId)
    if (error) {
      showMessage('❌ Error deleting shot.', 'error')
    } else {
      showMessage('✅ Shot deleted!')
      fetchShots()
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl mb-4">
              <span className="text-3xl">⚙️</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Admin Panel</h1>
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
        <div className="relative max-w-2xl mx-auto px-6 py-8 text-center">
          <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
            Admin Only
          </div>
          <h1 className="text-3xl font-black text-white mb-1">⚙️ Admin Panel</h1>
          <p className="text-gray-400">Million Dollar Mountain Challenge</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {message && (
          <div className={`px-4 py-4 rounded-xl mb-6 text-center font-bold ${
            messageType === 'success' ? 'bg-green-600/10 border border-green-500/30 text-green-400' : 'bg-red-600/10 border border-red-500/30 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Reset leaderboard */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-black text-white mb-1">🗑️ Reset Leaderboard</h2>
              <p className="text-gray-500 text-sm">Deletes all shot attempts. Use at the start of a new event.</p>
            </div>
            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-black py-2 px-5 rounded-xl transition-all text-sm whitespace-nowrap ml-4"
            >
              {loading ? 'Resetting...' : 'Reset'}
            </button>
          </div>
        </div>

        {/* Edit shots */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-black text-white">✏️ Edit Shot Distances</h2>
            <p className="text-gray-500 text-sm">{shots.length} shots recorded</p>
          </div>

          {shots.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">No shots recorded yet.</div>
          )}

          {shots.map((shot, index) => (
            <div key={shot.id} className={`px-6 py-4 flex items-center justify-between border-b border-gray-800/50 last:border-0 ${index % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm font-bold w-6">{index + 1}</span>
                <div>
                  <p className="font-bold text-white uppercase tracking-wide text-sm">{shot.players?.name}</p>
                  <p className="text-blue-400 font-black">{formatDistance(shot.distance_to_pin)}</p>
                </div>
              </div>

              {editingShot === shot.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editFeet}
                    onChange={(e) => setEditFeet(e.target.value)}
                    placeholder="Ft"
                    className="w-16 bg-gray-800 text-white border border-gray-600 focus:border-blue-500 rounded-lg px-2 py-1.5 text-center outline-none"
                  />
                  <input
                    type="number"
                    value={editInches}
                    onChange={(e) => setEditInches(e.target.value)}
                    placeholder="In"
                    className="w-16 bg-gray-800 text-white border border-gray-600 focus:border-blue-500 rounded-lg px-2 py-1.5 text-center outline-none"
                  />
                  <button onClick={() => handleSaveEdit(shot.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm transition-all">Save</button>
                  <button onClick={() => setEditingShot(null)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm transition-all">Cancel</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(shot)} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-3 py-1.5 rounded-lg font-bold text-sm transition-all">Edit</button>
                  <button onClick={() => handleDelete(shot.id)} className="bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400 px-3 py-1.5 rounded-lg font-bold text-sm transition-all">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}