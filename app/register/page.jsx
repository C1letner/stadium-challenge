'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [selectedPackage, setSelectedPackage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [card, setCard] = useState(null)

  const packages = [
    { id: '3shots', label: '3 Shots', price: '$30', shots: 3, amount: 30, description: 'Starter package' },
    { id: '6shots', label: '6 Shots', price: '$50', shots: 6, amount: 50, description: 'Most popular' },
    { id: '10shots', label: '10 Shots', price: '$80', shots: 10, amount: 80, description: 'Best value' },
  ]

  useEffect(() => {
    if (step === 3) {
      const existing = document.getElementById('square-sdk')
      if (existing) {
        initCard()
        return
      }
      const script = document.createElement('script')
      script.id = 'square-sdk'
      script.src = 'https://web.squarecdn.com/v1/square.js'
      script.onload = initCard
      document.body.appendChild(script)
    }
  }, [step])

  const initCard = async () => {
    try {
      const payments = window.Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APP_ID,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
      )
      const cardInstance = await payments.card()
      await cardInstance.attach('#card-container')
      setCard(cardInstance)
    } catch (err) {
      console.error('Square init error:', err)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePayment = async () => {
    if (!card) {
      alert('Payment form not ready. Please wait a moment.')
      return
    }
    setLoading(true)
    try {
      const result = await card.tokenize()
      if (result.status !== 'OK') {
        alert('Card error: ' + result.errors[0].message)
        setLoading(false)
        return
      }

      const pkg = packages.find(p => p.id === selectedPackage)

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          packageType: selectedPackage,
          playerName: form.name,
          playerEmail: form.email,
          playerPhone: form.phone,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        alert('Payment failed. Please try again.')
        setLoading(false)
        return
      }

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert([{ name: form.name, email: form.email, phone: form.phone }])
        .select()
        .single()

      if (playerError) throw playerError

      await supabase.from('entries').insert([{
        player_id: player.id,
        package_size: pkg.shots,
        paid: true,
        payment_amount: pkg.amount
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
            <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="flex flex-col gap-4">
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-400"
                  placeholder="John Smith" />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-400"
                  placeholder="john@example.com" />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Phone Number</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} required
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-400"
                  placeholder="555-123-4567" />
              </div>
              <button type="submit" className="bg-green-500 hover:bg-green-400 text-white text-xl font-bold py-4 px-8 rounded-xl mt-4">
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
                <div key={pkg.id} onClick={() => setSelectedPackage(pkg.id)}
                  className={`cursor-pointer border-2 rounded-xl p-5 flex items-center justify-between transition-all ${
                    selectedPackage === pkg.id ? 'border-green-400 bg-green-900' : 'border-gray-600 bg-gray-800 hover:border-gray-400'
                  }`}>
                  <div>
                    <p className="text-xl font-bold text-white">{pkg.label}</p>
                    <p className="text-gray-400 text-sm">{pkg.description}</p>
                  </div>
                  <p className="text-3xl font-black text-green-400">{pkg.price}</p>
                </div>
              ))}
            </div>
            <button onClick={() => { if (selectedPackage) setStep(3); else alert('Please select a package.') }}
              className="w-full bg-green-500 hover:bg-green-400 text-white text-xl font-bold py-4 px-8 rounded-xl">
              Next →
            </button>
            <button onClick={() => setStep(1)} className="w-full mt-3 text-gray-400 hover:text-white text-sm py-2">
              ← Back
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-4xl font-bold text-green-400 mb-2 text-center">Payment</h1>
            <p className="text-gray-400 text-center mb-6">
              {packages.find(p => p.id === selectedPackage)?.label} — {packages.find(p => p.id === selectedPackage)?.price}
            </p>
            <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 mb-6">
              <label className="text-gray-300 text-sm mb-3 block">Card Details</label>
              <div id="card-container" className="min-h-12"></div>
            </div>
            <button onClick={handlePayment} disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white text-xl font-bold py-4 px-8 rounded-xl">
              {loading ? 'Processing...' : `Pay ${packages.find(p => p.id === selectedPackage)?.price}`}
            </button>
            <button onClick={() => setStep(2)} className="w-full mt-3 text-gray-400 hover:text-white text-sm py-2">
              ← Back
            </button>
          </>
        )}
      </div>
    </main>
  )
}