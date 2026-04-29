'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

const HOURS_START = 11
const HOURS_END = 20
const SLOT_MINUTES = 5

function generateTimeSlots() {
  const slots = []
  for (let h = HOURS_START; h < HOURS_END; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      const hour = h % 12 === 0 ? 12 : h % 12
      const ampm = h < 12 ? 'AM' : 'PM'
      const min = m.toString().padStart(2, '0')
      const display = `${hour}:${min} ${ampm}`
      const value = `${h.toString().padStart(2, '0')}:${min}:00`
      slots.push({ display, value })
    }
  }
  return slots
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function BookPage() {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])
  const [selectedPackage, setSelectedPackage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [card, setCard] = useState(null)

  const packages = [
    { id: '3shots', label: '3 Shots', price: '$30', shots: 3, amount: 30, description: 'Starter package' },
    { id: '6shots', label: '6 Shots', price: '$50', shots: 6, amount: 50, description: 'Most popular' },
    { id: '10shots', label: '10 Shots', price: '$80', shots: 10, amount: 80, description: 'Best value' },
  ]

  const timeSlots = generateTimeSlots()

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (selectedDate) fetchBookedSlots(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    if (step === 4) {
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

  const fetchBookedSlots = async (date) => {
    const { data } = await supabase
      .from('bookings')
      .select('booking_time')
      .eq('booking_date', date)
    setBookedSlots(data?.map(b => b.booking_time) || [])
  }

  const handleChange = (e) => {
    const value = e.target.name === 'name' ? e.target.value.toUpperCase() : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handlePayment = async () => {
    if (!card) { alert('Payment form not ready.'); return }
    setLoading(true)
    try {
      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('email', form.email)
        .single()

      if (existing) {
        alert('This email is already registered! Please let staff know at the venue to buy more shots.')
        setLoading(false)
        return
      }

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

      await supabase.from('bookings').insert([{
        player_id: player.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        package_type: selectedPackage,
        payment_id: data.paymentId
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
          <h1 className="text-4xl font-black text-white mb-2">You're booked!</h1>
          <p className="text-blue-400 font-bold text-lg mb-4">See you on the sim!</p>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left mb-4">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Your Booking</p>
            <p className="text-white font-black text-lg">{form.name}</p>
            <p className="text-blue-400 font-bold">{formatDate(selectedDate)}</p>
            <p className="text-blue-400 font-bold">{timeSlots.find(s => s.value === selectedTime)?.display}</p>
            <p className="text-gray-400 mt-2">{packages.find(p => p.id === selectedPackage)?.label} — {packages.find(p => p.id === selectedPackage)?.price}</p>
          </div>
          <p className="text-gray-500 text-sm">A confirmation email has been sent to {form.email}</p>
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
            Book Your Tee Time
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Schedule Your Shot</h1>
          <p className="text-gray-400 text-sm">Pick a time, buy your shots, qualify for $1M</p>
          <div className="flex justify-center gap-3 mt-4">
            {[1,2,3,4].map(s => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${step >= s ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-700 text-gray-600'}`}>{s}</div>
                {s < 4 && <div className={`w-6 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-gray-700'}`}></div>}
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2">
            {step === 1 ? 'Pick date & time' : step === 2 ? 'Your details' : step === 3 ? 'Choose package' : 'Payment'}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">

        {/* Step 1 - Date & Time */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                min={today}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }}
                className="w-full [color-scheme:dark] bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors"
              />
            </div>

            {selectedDate && (
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">
                  Select Time — {formatDate(selectedDate)}
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
                  {timeSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot.value)
                    return (
                      <button
                        key={slot.value}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot.value)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                          isBooked
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed line-through'
                            : selectedTime === slot.value
                            ? 'bg-blue-600 text-white border-2 border-blue-400'
                            : 'bg-gray-900 border border-gray-700 text-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {slot.display}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => { if (selectedDate && selectedTime) setStep(2); else alert('Please select a date and time.') }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl mt-6 transition-all"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2 - Details */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3) }} className="flex flex-col gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors uppercase"
                placeholder="JOHN SMITH" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors"
                placeholder="john@example.com" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Phone</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required
                className="w-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-colors"
                placeholder="555-123-4567" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl mt-2 transition-all">
              Next →
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 hover:text-white text-sm py-2 transition-colors">← Back</button>
          </form>
        )}

        {/* Step 3 - Package */}
        {step === 3 && (
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
            <button onClick={() => { if (selectedPackage) setStep(4); else alert('Please select a package.') }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all">
              Next →
            </button>
            <button onClick={() => setStep(2)} className="w-full mt-3 text-gray-500 hover:text-white text-sm py-2 transition-colors">← Back</button>
          </div>
        )}

        {/* Step 4 - Payment */}
        {step === 4 && (
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Booking Summary</p>
              <p className="text-white font-black">{form.name}</p>
              <p className="text-blue-400">{formatDate(selectedDate)} at {timeSlots.find(s => s.value === selectedTime)?.display}</p>
              <p className="text-gray-400">{packages.find(p => p.id === selectedPackage)?.label} — {packages.find(p => p.id === selectedPackage)?.price}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6">
              <label className="text-gray-400 text-xs uppercase tracking-widest mb-3 block">Card Details</label>
              <div id="card-container" className="min-h-12"></div>
            </div>
            <button onClick={handlePayment} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-black py-4 rounded-xl transition-all">
              {loading ? 'Processing...' : `Pay ${packages.find(p => p.id === selectedPackage)?.price} →`}
            </button>
            <button onClick={() => setStep(3)} className="w-full mt-3 text-gray-500 hover:text-white text-sm py-2 transition-colors">← Back</button>
            <p className="text-gray-600 text-xs text-center mt-4">🔒 Secured by Square</p>
          </div>
        )}
      </div>
    </main>
  )
}