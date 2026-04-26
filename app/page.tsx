import Link from 'next/link'

function LogoMark({ size = 80 }: { size?: number }) {
  const s = size
  const cx = s / 2
  const top = s * 0.35
  const mid = s * 0.88
  const left = s * 0.1
  const right = s * 0.9
  const m1l = s * 0.2
  const m1r = s * 0.8
  const m2l = s * 0.3
  const m2r = s * 0.7
  const m3l = s * 0.38
  const m3r = s * 0.62
  const stickX = cx
  const stickTop = s * 0.04
  const stickBottom = top
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <line x1={stickX} y1={stickBottom} x2={stickX} y2={stickTop} stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points={`${stickX},${stickTop} ${stickX + s*0.22},${stickTop + s*0.09} ${stickX},${stickTop + s*0.18}`} fill="#38bdf8"/>
      <polygon points={`${cx},${top} ${left},${mid} ${right},${mid}`} stroke="#3b82f6" strokeWidth="2.5" fill="none"/>
      <polygon points={`${cx},${top + s*0.08} ${m1l},${mid} ${m1r},${mid}`} fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5"/>
      <polygon points={`${cx},${top + s*0.16} ${m2l},${mid} ${m2r},${mid}`} fill="#3b82f6"/>
      <polygon points={`${cx},${top + s*0.24} ${m3l},${mid} ${m3r},${mid}`} fill="#60a5fa"/>
    </svg>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-950 to-gray-950"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>
        
        <div className="relative max-w-lg mx-auto px-6 pt-12 pb-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <LogoMark size={80} />
            </div>
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
            <Link href="/register">
              <button className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-lg font-black py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-900">
                🏌️ Enter Competition
              </button>
            </Link>
            <Link href="/leaderboard">
              <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all">
                📊 View Leaderboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border-y border-gray-800 px-6 py-4">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-blue-400">$1M</p>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Prize Pool</p>
          </div>
          <div>
            <p className="text-2xl font-black text-cyan-400">Top 20</p>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Advance</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">Live</p>
            <p className="text-gray-500 text-xs uppercase tracking-wide">Leaderboard</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-xl font-black text-white mb-1">Shot Packages</h2>
        <p className="text-gray-500 text-sm mb-6">Buy shots to qualify for the finale</p>
        <div className="flex flex-col gap-3">
          <Link href="/register">
            <div className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer group">
              <div>
                <p className="font-black text-white text-lg">3 Shots</p>
                <p className="text-gray-500 text-sm">Starter package</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-400">$30</p>
                <p className="text-gray-600 text-xs group-hover:text-blue-400 transition-all">Enter →</p>
              </div>
            </div>
          </Link>
          <Link href="/register">
            <div className="bg-gray-900 border-2 border-blue-500 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">MOST POPULAR</div>
              <div>
                <p className="font-black text-white text-lg">6 Shots</p>
                <p className="text-gray-500 text-sm">Best bang for your buck</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-400">$50</p>
                <p className="text-gray-600 text-xs">Enter →</p>
              </div>
            </div>
          </Link>
          <Link href="/register">
            <div className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer group">
              <div>
                <p className="font-black text-white text-lg">10 Shots</p>
                <p className="text-gray-500 text-sm">Best value</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-400">$80</p>
                <p className="text-gray-600 text-xs group-hover:text-blue-400 transition-all">Enter →</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}