'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const ADMIN_PIN = '1977'

export default function Admin() {
  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [playerData, setPlayerData] = useState([])
  const [search, setSearch] = useState('')
  const [editingName, setEditingName] = useState(null)
  const [editNameValue, setEditNameValue] = useState('')
  const [editingShot, setEditingShot] = useState(null)
  const [editFeet, setEditFeet] = useState('')
  const [editInches, setEditInches] = useState('')

  const handlePin = (e) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setAuthenticated(true)
      fetchData()
    } else {
      alert('Incorrect PIN.')
      setPin('')
    }
  }

  const fetchData = async () => {
    const { data: players } = await supabase
      .from('players')
      .select('id, name, email')
      .order('name')

    const { data: shots } = await supabase
      .from('shot_attempts')
      .select('id, player_id, distance_to_pin')

    const bestShots = {}
    shots?.forEach(shot => {
      if (!bestShots[shot.player_id] || shot.distance_to_pin < bestShots[shot.player_id].distance_to_pin) {
        bestShots[shot.player_id] = shot
      }
    })

    const combined = players?.map(p => ({
      ...p,
      bestShot: bestShots[p.id] || null
    })) || []

    setPlayerData(combined)
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
    const confirmed = confirm('Reset the leaderboard? This deletes ALL shot attempts.')
    if (!confirmed) return
    setLoading(true)
    const { error } = await supabase
      .from('shot_attempts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      showMessage('❌ Error resetting.', 'error')
    } else {
      showMessage('✅ Leaderboard reset!')
      fetchData()
    }
    setLoading(false)
  }

  const handleSaveName = async (playerId) => {
    const { error } = await supabase
      .from('players')
      .update({ name: editNameValue.toUpperCase() })
      .eq('id', playerId)
    if (error) {
      showMessage('❌ Error updating name.', 'error')
    } else {
      showMessage('✅ Name updated!')
      setEditingName(null)
      fetchData()
    }
  }

  const handleSaveShot = async (shotId) => {
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
      fetchData()
    }
  }

  const handleDeletePlayer = async (playerId) => {
    const confirmed = confirm('Delete this player and all their shots?')
    if (!confirmed) return
    await supabase.from('shot_attempts').delete().eq('player_id', playerId)
    const { error } = await supabase.from('players').delete().eq('id', playerId)
    if (error) {
      showMessage('❌ Error deleting player.', 'error')
    } else {
      showMessage('✅ Player deleted!')
      fetchData()
    }
  }

  const filteredPlayers = playerData.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

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
        <div className="relative max-w-3xl mx-auto px-6 py-8 text-center">
          <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">Admin Only</div>
          <h1 className="text-3xl font-black text-white mb-1">⚙️ Admin Panel</h1>
          <p className="text-gray-400">Million Dollar Mountain Challenge</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {message && (
          <div className={`px-4 py-4 rounded-xl mb-6 text-center font-bold ${
            messageType === 'success' ? 'bg-green-600/10 border border-green-500/30 text-green-400' : 'bg-red-600/10 border border-red-500/30 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Reset */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white mb-0.5">🗑️ Reset Leaderboard</h2>
            <p className="text-gray-500 text-sm">Deletes all shot attempts. Use at start of new event.</p>
          </div>
          <button onClick={handleReset} disabled={loading}
            className="bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-black py-2 px-5 rounded-xl transition-all text-sm ml-4 whitespace-nowrap">
            {loading ? 'Resetting...' : 'Reset'}
          </button>
        </div>

        {/* Combined player + shot list */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">👤 Players & Shots</h2>
              <p className="text-gray-500 text-sm">{playerData.length} players · {filteredPlayers.length} shown</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-4 py-3 border-b border-gray-800">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search by name or email..."
              className="w-full bg-gray-800 text-white border border-gray-700 focus:border-blue-500 rounded-lg px-4 py-2.5 outline-none transition-colors text-sm"
            />
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 px-4 py-2 border-b border-gray-800 text-xs text-gray-600 uppercase tracking-widest font-bold">
            <div className="col-span-4">Player</div>
            <div className="col-span-3 text-center">Best Shot</div>
            <div className="col-span-5 text-right">Actions</div>
          </div>

          {filteredPlayers.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              {search ? `No players matching "${search}"` : 'No players yet.'}
            </div>
          )}

          {filteredPlayers.map((player, index) => (
            <div key={player.id} className={`px-4 py-4 border-b border-gray-800/50 last:border-0 ${index % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
              <div className="grid grid-cols-12 items-center">
                <div className="col-span-4">
                  {editingName === player.id ? (
                    <input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value.toUpperCase())}
                      className="w-full bg-gray-800 text-white border border-blue-500 rounded-lg px-2 py-1 text-sm outline-none uppercase"
                    />
                  ) : (
                    <div>
                      <p className="font-bold text-white text-sm uppercase tracking-wide">{player.name}</p>
                      <p className="text-gray-600 text-xs truncate">{player.email}</p>
                    </div>
                  )}
                </div>

                <div className="col-span-3 text-center">
                  {editingShot === player.bestShot?.id ? (
                    <div className="flex gap-1 justify-center">
                      <input type="number" value={editFeet} onChange={(e) => setEditFeet(e.target.value)}
                        placeholder="Ft" className="w-12 bg-gray-800 text-white border border-gray-600 rounded px-1 py-1 text-center text-xs outline-none" />
                      <input type="number" value={editInches} onChange={(e) => setEditInches(e.target.value)}
                        placeholder="In" className="w-12 bg-gray-800 text-white border border-gray-600 rounded px-1 py-1 text-center text-xs outline-none" />
                    </div>
                  ) : (
                    <span className={`font-black text-sm ${player.bestShot ? 'text-blue-400' : 'text-gray-600'}`}>
                      {player.bestShot ? formatDistance(player.bestShot.distance_to_pin) : '—'}
                    </span>
                  )}
                </div>

                <div className="col-span-5 flex gap-1.5 justify-end flex-wrap">
                  {editingName === player.id ? (
                    <>
                      <button onClick={() => handleSaveName(player.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">Save</button>
                      <button onClick={() => setEditingName(null)} className="bg-gray-700 text-white px-2 py-1 rounded text-xs">Cancel</button>
                    </>
                  ) : editingShot === player.bestShot?.id ? (
                    <>
                      <button onClick={() => handleSaveShot(player.bestShot.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">Save</button>
                      <button onClick={() => setEditingShot(null)} className="bg-gray-700 text-white px-2 py-1 rounded text-xs">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingName(player.id); setEditNameValue(player.name) }}
                        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-2 py-1 rounded text-xs font-bold">Name</button>
                      {player.bestShot && (
                        <button onClick={() => { setEditingShot(player.bestShot.id); setEditFeet(Math.floor(player.bestShot.distance_to_pin/12).toString()); setEditInches(Math.round(player.bestShot.distance_to_pin%12).toString()) }}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-2 py-1 rounded text-xs font-bold">Shot</button>
                      )}
                      <button onClick={() => handleDeletePlayer(player.id)}
                        className="bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400 px-2 py-1 rounded text-xs font-bold">Del</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}