import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Million Dollar Mountain Challenge',
  description: 'Mr Lucky\'s Golf — Closest to the pin wins',
}

function LogoMark({ size = 36 }: { size?: number }) {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}>
        <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark size={36} />
            <span className="text-white font-black text-lg tracking-wide hover:text-blue-400 transition-colors">Mr Lucky's Golf</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/register" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Register</Link>
            <Link href="/leaderboard" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Leaderboard</Link>
            <Link href="/shots" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Staff</Link>
            <Link href="/admin" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Admin</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}