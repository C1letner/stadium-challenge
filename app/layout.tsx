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
        <header className="flex items-center justify-between px-6 py-2 bg-gray-900 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/LUCKYS LOGO UPDATED.png"
              alt="Mr Lucky's Golf"
              width={52}
              height={52}
              className="rounded-lg"
            />
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