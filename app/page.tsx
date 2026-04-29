import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../lib/supabase'

async function getLeader() {
  try {
    const { data } = await supabase
      .from('shot_attempts')
      .select('player_id, distance_to_pin, players(name)')
      .order('distance_to_pin', { ascending: true })
      .limit(1)
      .single()
    return data
  } catch { return null }
}

function formatDistance(totalInches: number) {
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}' ${inches}"`
}

function formatLeaderName(fullName: string | undefined) {
  if (!fullName) return '—'
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export default async function Home() {
  const leader = await getLeader()

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-950 to-gray-950"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>
        
        <div className="relative max-w-lg mx-auto px-6 pt-12 pb-10 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/LUCKYS LOGO UPDATED.png"
              alt="Mr Lucky's Golf"
              width={140}
              height={140}
              className="rounded-2xl shadow-2xl shadow-blue-900/50"
            />
          </div>
          <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
            Live Qualifier
          </div>
          <h1 className="text-5xl font-black text-white mb-2 leading-tight">
            Million Dollar<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Mountain Challenge
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-2">Mr Lucky's Golf</p>
          <p className="text-gray-500 mb-10">Closest to the pin advances to the $1M finale</p>

          <div className="flex flex-col gap-3">
            <Link href="/book">
              <div className="w-full bg-gray-900 border-2 border-blue-500 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-600/10">
                <div className="text-left">
                  <p className="font-black text-white text-xl uppercase tracking-wide">Book a Tee Time</p>
                  <p className="text-blue-400 text-sm">Pick your slot · Pay · Qualify</p>
                </div>
                <span className="text-blue-400 font-black text-2xl">→</span>
              </div>
            </Link>
            <Link href="/register">
              <div className="w-full bg-gray-900 border-2 border-blue-500 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-600/10">
                <div className="text-left">
                  <p className="font-black text-white text-xl uppercase tracking-wide">Enter Competition</p>
                  <p className="text-blue-400 text-sm">Buy shots · Start qualifying</p>
                </div>
                <span className="text-blue-400 font-black text-2xl">→</span>
              </div>
            </Link>
            <Link href="/leaderboard">
              <div className="w-full bg-gray-900 border-2 border-gray-700 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer hover:border-gray-500">
                <div className="text-left">
                  <p className="font-black text-white text-xl uppercase tracking-wide">View Leaderboard</p>
                  <p className="text-gray-400 text-sm">See current standings</p>
                </div>
                <span className="text-gray-400 font-black text-2xl">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-900 border-y border-gray-800 px-6 py-4">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-blue-400">$1M</p>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Grand Prize</p>
          </div>
          <div>
            <p className="text-2xl font-black text-cyan-400">Top 20</p>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Advance</p>
          </div>
          <div>
            {leader ? (
              <>
                <p className="text-lg font-black text-yellow-400 truncate">{formatLeaderName((leader.players as any)?.name)}</p>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Leading · {formatDistance(leader.distance_to_pin)}</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-black text-white">—</p>
                <p className="text-gray-500 text-xs uppercase tracking-wide">No leader yet</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-xl font-black text-white mb-1">Shot Packages</h2>
        <p className="text-gray-500 text-sm mb-6">Buy shots to qualify for the $1M finale</p>
        <div className="flex flex-col gap-3">
          <Link href="/book">
            <div className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer group">
              <div>
                <p className="font-black text-white text-lg uppercase tracking-wide">3 Shots</p>
                <p className="text-gray-500 text-sm">Starter package</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-400">$30</p>
                <p className="text-gray-600 text-xs group-hover:text-blue-400 transition-all">Book →</p>
              </div>
            </div>
          </Link>
          <Link href="/book">
            <div className="bg-gray-900 border-2 border-blue-500 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">MOST POPULAR</div>
              <div>
                <p className="font-black text-white text-lg uppercase tracking-wide">6 Shots</p>
                <p className="text-gray-500 text-sm">Best bang for your buck</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-400">$50</p>
                <p className="text-gray-600 text-xs">Book →</p>
              </div>
            </div>
          </Link>
          <Link href="/book">
            <div className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer group">
              <div>
                <p className="font-black text-white text-lg uppercase tracking-wide">10 Shots</p>
                <p className="text-gray-500 text-sm">Best value</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-400">$80</p>
                <p className="text-gray-600 text-xs group-hover:text-blue-400 transition-all">Book →</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}