import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import Image from 'next/image'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}>
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="flex items-center justify-between px-4 py-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/LUCKYS LOGO UPDATED.png"
                alt="Mr Lucky's Golf"
                width={44}
                height={44}
                className="rounded-lg"
              />
              <span className="text-white font-black text-base tracking-wide">Mr Lucky's Golf</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/register" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Register</Link>
              <Link href="/leaderboard" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Leaderboard</Link>
              <Link href="/shots" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Staff</Link>
              <Link href="/admin" className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors">Admin</Link>
            </nav>

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <input type="checkbox" id="menu-toggle" className="hidden peer" />
              <label htmlFor="menu-toggle" className="cursor-pointer flex flex-col gap-1.5 p-2">
                <span className="block w-6 h-0.5 bg-gray-300"></span>
                <span className="block w-6 h-0.5 bg-gray-300"></span>
                <span className="block w-6 h-0.5 bg-gray-300"></span>
              </label>
            </div>
          </div>

          {/* Mobile dropdown */}
          <div className="md:hidden max-h-0 overflow-hidden peer-checked:max-h-64 transition-all duration-300 ease-in-out">
            <nav className="flex flex-col px-4 pb-4 gap-1">
              <Link href="/register" className="text-gray-300 hover:text-blue-400 font-medium py-2.5 border-b border-gray-800 transition-colors">
                🏌️ Register
              </Link>
              <Link href="/leaderboard" className="text-gray-300 hover:text-blue-400 font-medium py-2.5 border-b border-gray-800 transition-colors">
                📊 Leaderboard
              </Link>
              <Link href="/shots" className="text-gray-300 hover:text-blue-400 font-medium py-2.5 border-b border-gray-800 transition-colors">
                🎯 Staff — Record Shot
              </Link>
              <Link href="/admin" className="text-gray-300 hover:text-blue-400 font-medium py-2.5 transition-colors">
                ⚙️ Admin Panel
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}