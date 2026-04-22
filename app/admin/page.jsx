'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const ADMIN_PIN = '1977'

export default function Admin() {
  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handlePin = (e) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setAuthenticated(true)
    } else {
      alert('Incorrect PIN.')
      setPin('')
    }
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
      console.error(error)
    } else {
      setMessage('✅ Leaderboard has been reset!')
    }
    setLoading(false)
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
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-green-400 text-center mb-2">⚙️ Admin Panel</h1>
        <p className="text-gray-400 text-center mb-8">Million Dollar Mountain Challenge</p>

        {message && (
          <div className="bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-xl mb-6 text-center">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
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
        </div>
      </div>
    </main>
  )
}