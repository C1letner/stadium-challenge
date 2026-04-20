'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('players')
      .insert([{ name: form.name, email: form.email, phone: form.phone }])

    if (error) {
      alert('Something went wrong. Please try again.')
      console.error(error)
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⛳</div>
          <h1 className="text-4xl font-bold text-green-400 mb-4">You're registered!</h1>
          <p className="text-gray-300">Good luck on the course. May your shot be closest to the pin!</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-green-400 mb-2 text-center">⛳ Register</h1>
        <p className="text-gray-400 text-center mb-8">Enter your details to join the competition</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-400"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-400"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Phone Number</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-400"
              placeholder="555-123-4567"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white text-xl font-bold py-4 px-8 rounded-xl mt-4"
          >
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>
      </div>
    </main>
  )
}