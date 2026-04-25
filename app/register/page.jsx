'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [selectedPackage, setSelectedPackage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const packages = [
    { id: '3shots', label: '3 Shots', price: '$30', description: 'Starter package' },
    { id: '6shots', label: '6 Shots', price: '$50', description: 'Most popular' },
    { id: '10shots', label: '10 Shots', price: '$80', description: 'Best value' },
  ]

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleNext = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePayment = async () => {
    if (!selectedPackage) {
      alert('Please select a package.')
      return
    }
    setLoading(true)

    try {
      // Save player to database
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert([{ name: form.name, email: form.email, phone: form.phone }])
        .select()
        .single()

      if (playerError) throw playerError

      // Create payment via Square (redirect to Square hosted payment)
      const priceMap = { '3shots': 30, '6shots': 50, '10shots': 80 }
      const shotMap = { '3shots': 3, '6shots': 6, '10shots': 10 }

      // Save entry record
      await supabase.from('entries').insert([{
        player_id: player.id,
        package_size: shotMap[selectedPackage],
        paid: false,
        payment_amount: priceMap[selectedPackage]
      }])

      setDone(true)
    } catch (error) {
      console.error(error)
      alert('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-green-400 mb-4">You're registered!</h1>
          <p className="text-gray-300 mb-2">Thank you, {form.name}!</p>
          <p className="text-gray-400 mb-6">A confirmation email will be sent to {form.email} with instructions on where to take your shots.</p>
          <div className="bg-gray-800 rounded-xl p-4 text-left">
            <p className="text-green-400 font-bold mb-1">Your package:</p>
            <p className="text-white">{packages.find(p => p.id === selectedPackage)?.label} — {packages.find(p => p.id === selectedPackage)?.price}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full">

        {step === 1 && (
          <>
            <h1 className="text-4xl font-bold text-green-400 mb-2 text-center">Register</h1>
            <p className="text-gray-400 text-center mb-8">Enter your details to join the competition</p>

            <form onSubmit={handleNext} className="flex flex-col gap-4">
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
                className="bg-green-500 hover:bg-green-400 text-white text-xl font-bold py-4 px-8 rounded-xl mt-4"
              >
                Next →
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-4xl font-bold text-green-400 mb-2 text-center">Choose Your Package</h1>
            <p className="text-gray-400 text-center mb-8">Select how many shots you want</p>

            <div className="flex flex-col gap-4 mb-8">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`cursor-pointer border-2 rounded-xl p-5 flex items-center justify-between transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-green-400 bg-green-900'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-400'
                  }`}
                >
                  <div>
                    <p className="text-xl font-bold text-white">{pkg.label}</p>
                    <p className="text-gray-400 text-sm">{pkg.description}</p>
                  </div>
                  <p className="text-3xl font-black text-green-400">{pkg.price}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !selectedPackage}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white text-xl font-bold py-4 px-8 rounded-xl"
            >
              {loading ? 'Processing...' : 'Complete Registration'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full mt-3 text-gray-400 hover:text-white text-sm py-2"
            >
              ← Back
            </button>
          </>
        )}
      </div>
    </main>
  )
}