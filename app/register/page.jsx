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
      if (existing) { initCard(); return }
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
      const cardInstance = await payments.card({
        style: {
          '.input-container': { borderColor: '#374151', borderRadius: '8px' },
          '.input-container.is-focus': { borderColor: '#3b82f6' },
          input: { color: '#ffffff', backgroundColor: '#111827' },
          'input::placeholder': { color: '#6b7280' },
        }
      })
      await cardInstance.attach('#card-container')
      setCard(cardInstance)
    } catch (err) { console.error('Square init error:', err) }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePayment = async () => {
    if (!card) { alert('Payment form not ready.'); return }
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
      if (!data.success) { alert('Payment failed. Please try again.'); setLoading(false); return }
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert([{ name: form.name, email: form.email, phone: form.phone }])
        .select().single()
      if (playerError) throw playerError
      await supabase.from('entries').insert([{
        player_id: player.id, package_size: pkg.shots, paid: true, payment_amount: pkg.amount
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
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-4xl font-black text-white mb-2">You're in!</h1>
          <p className="text-blue-400 font-bold text-lg mb-4">Welcome to the Million Dollar Mountain Challenge</p>
          <p className="text-gray-400 mb-6">A confirmation email will be sent to <span className="text-white font-bold">{form.email}</span> with your next steps.</p>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left mb-6">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Your Package</p>
            <p className="text-white font-black text-xl">{packages.find(p => p.id === selectedPackage)?.label} — {packages.find(p => p.id === selectedPackage)?.price}</p>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-5 text-left">
            <p className="text-blue-400 font-black mb-2">🏆 What happens next?</p>
            <p className="text-gray-400 text-sm">Visit Mr Lucky's Golf simulator, take your shots, and your best shot will appear on the live leaderboard. Top 20 advance to the $1M finale!</p>
          </div>
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
            Live Qualifier
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Enter the Challenge</h1>
          <p className="text-gray-400 text-sm">Top 20 advance to the $1M finale</p>
          <div className="flex justify-center gap-3 mt-4">
            {[1,2,3].map(s => (
              <div key={s} className={`flex items-center gap-1`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${step >= s ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-700 text-gray-600'}`}>{s}</div>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-gray-700'}`}></div>}
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2">{step === 1 ? 'Your details' : step === 2 ? 'Choose package' : 'Payment'}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="flex flex-col gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors"
                placeholder="John Smith" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors"
                placeholder="john@example.com" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Phone Number</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required
                className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors"
                placeholder="555-123-4567" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl mt-2 transition-all">
              Next →
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            <div className="flex flex-col gap-3 mb-6">
              {packages.map((pkg) => (
                <div key={pkg.id} onClick={() => setSelectedPackage(pkg.id)}
                  className={`cursor-pointer border-2 rounded-xl p-5 flex items-center justify-between transition-all ${
                    selectedPackage === pkg.id ? 'border-blue-500 bg-blue-600/10' : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                  }`}>
                  <div>
                    <p className="font-black text-white text-lg uppercase tracking-wide">{pkg.label}</p>
                    <p className="text-gray-500 text-sm">{pkg.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-blue-400">{pkg.price}</p>
                    {selectedPackage === pkg.id && <p className="text-blue-400 text-xs font-bold">Selected ✓</p>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { if (selectedPackage) setStep(3); else alert('Please select a package.') }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all">
              Next →
            </button>
            <button onClick={() => setStep(1)} className="w-full mt-3 text-gray-500 hover:text-white text-sm py-2 transition-colors">← Back</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Paying for</p>
              <p className="text-white font-black text-xl">{packages.find(p => p.id === selectedPackage)?.label} — {packages.find(p => p.id === selectedPackage)?.price}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6">
              <label className="text-gray-400 text-xs uppercase tracking-widest mb-3 block">Card Details</label>
              <div id="card-container" className="min-h-12"></div>
            </div>
            <button onClick={handlePayment} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-black py-4 rounded-xl transition-all">
              {loading ? 'Processing...' : `Pay ${packages.find(p => p.id === selectedPackage)?.price} →`}
            </button>
            <button onClick={() => setStep(2)} className="w-full mt-3 text-gray-500 hover:text-white text-sm py-2 transition-colors">← Back</button>
            <p className="text-gray-600 text-xs text-center mt-4">🔒 Secured by Square</p>
          </div>
        )}
      </div>
    </main>
  )
}