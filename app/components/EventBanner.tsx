'use client'
import { useState, useEffect } from 'react'

const QUALIFIERS = [
  { name: 'Qualifier 1', start: '2026-07-03T09:00:00', end: '2026-07-05T20:00:00' },
  { name: 'Qualifier 2', start: '2026-09-04T09:00:00', end: '2026-09-06T20:00:00' },
]

function getCurrentEvent() {
  const now = new Date()
  for (const q of QUALIFIERS) {
    const start = new Date(q.start)
    const end = new Date(q.end)
    if (now >= start && now <= end) {
      return { status: 'live', event: q, target: end }
    }
    if (now < start) {
      return { status: 'upcoming', event: q, target: start }
    }
  }
  return { status: 'finale', event: null, target: null }
}

function getTimeLeft(target: Date | null) {
  if (!target) return null
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

export default function EventBanner() {
  const [info, setInfo] = useState(getCurrentEvent())
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null)

  useEffect(() => {
    const tick = () => {
      const current = getCurrentEvent()
      setInfo(current)
      setTimeLeft(getTimeLeft(current.target))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  if (info.status === 'finale') {
    return (
      <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-2 border-yellow-500/50 rounded-xl p-5">
        <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-1">🏆 Finale</p>
        <p className="text-white font-black text-xl">$1M Live Finale Coming Soon</p>
        <p className="text-gray-400 text-sm mt-1">Qualifiers complete · Top 20 advance</p>
      </div>
    )
  }

  const isLive = info.status === 'live'
  const event = info.event!

  return (
    <div className={`relative overflow-hidden rounded-xl p-5 border-2 ${
      isLive
        ? 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/50'
        : 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/50'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {isLive && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
        <p className={`text-xs font-bold uppercase tracking-widest ${isLive ? 'text-red-400' : 'text-blue-400'}`}>
          {isLive ? '🔴 Live Now' : '📅 Next Qualifier'}
        </p>
      </div>

      <p className="text-white font-black text-xl mb-1">{event.name}</p>
      <p className="text-gray-300 text-sm mb-4">
        {new Date(event.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(event.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      {timeLeft && (
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-gray-950/60 rounded-lg py-2">
            <p className="text-2xl font-black text-white">{timeLeft.days}</p>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">Days</p>
          </div>
          <div className="bg-gray-950/60 rounded-lg py-2">
            <p className="text-2xl font-black text-white">{timeLeft.hours}</p>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">Hrs</p>
          </div>
          <div className="bg-gray-950/60 rounded-lg py-2">
            <p className="text-2xl font-black text-white">{timeLeft.minutes}</p>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">Min</p>
          </div>
          <div className="bg-gray-950/60 rounded-lg py-2">
            <p className="text-2xl font-black text-white">{timeLeft.seconds}</p>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">Sec</p>
          </div>
        </div>
      )}

      <p className="text-gray-400 text-xs mt-3 uppercase tracking-wide">
        {isLive ? 'Ends in' : 'Starts in'}
      </p>
    </div>
  )
}