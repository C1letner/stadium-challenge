import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Image from 'next/image'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}>
        <header className="flex items-center gap-3 px-6 py-3 bg-gray-800 border-b border-gray-700">
          <Link href="/">
            <Image
              src="/Mr luckys - Social logo.png"
              alt="Mr Lucky's Golf"
              width={40}
              height={40}
              className="rounded-full cursor-pointer"
            />
          </Link>
          <Link href="/" className="text-green-400 font-bold text-lg hover:text-green-300">
            Mr Lucky's Golf
          </Link>
        </header>
        {children}
      </body>
    </html>
  )
}
