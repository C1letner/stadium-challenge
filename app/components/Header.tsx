'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <Image
            src="/LUCKYS LOGO UPDATED.png"
            alt="Mr Lucky's Golf"
            width={44}
            height={44}
            className="rounded-lg"
          />
          <span className="text-white font-black text-base tracking-wide hover:text-blue-400 transition-colors">Mr Lucky's Golf</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/register" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Register</Link>
          <Link href="/leaderboard" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Leaderboard</Link>
          <Link href="/shots" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Staff</Link>
          <Link href="/admin" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Admin</Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col px-4 pb-4 gap-1 border-t border-gray-800">
          <Link href="/register" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-blue-400 font-medium py-3 border-b border-gray-800 transition-colors">
            🏌️ Register
          </Link>
          <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-blue-400 font-medium py-3 border-b border-gray-800 transition-colors">
            📊 Leaderboard
          </Link>
          <Link href="/shots" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-blue-400 font-medium py-3 border-b border-gray-800 transition-colors">
            🎯 Staff — Record Shot
          </Link>
          <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-blue-400 font-medium py-3 transition-colors">
            ⚙️ Admin Panel
          </Link>
        </nav>
      )}
    </header>
  )
}