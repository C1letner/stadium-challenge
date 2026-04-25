import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <Image
          src="/Mr luckys - Social logo.png"
          alt="Mr Lucky's Golf"
          width={160}
          height={160}
          className="mx-auto mb-6 rounded-full"
        />
        <h1 className="text-4xl font-bold text-green-400 mb-2">Million Dollar Mountain Challenge</h1>
        <p className="text-xl text-gray-300 mb-2">Mr Lucky's Golf</p>
        <p className="text-gray-400 mb-10">Closest to the pin wins</p>

        <div className="flex flex-col gap-4">
          <Link href="/register">
            <button className="w-full bg-green-500 hover:bg-green-400 text-white text-xl font-bold py-4 px-8 rounded-xl">
              Enter Competition
            </button>
          </Link>
          <Link href="/leaderboard">
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold py-4 px-8 rounded-xl">
              View Leaderboard
            </button>
          </Link>
          <Link href="/shots">
            <button className="w-full bg-blue-800 hover:bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-xl">
              🎯 Staff — Record Shot
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}