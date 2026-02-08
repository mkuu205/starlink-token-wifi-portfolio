import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || 'STARLINK TOKEN WIFI',
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Affordable and reliable internet services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </body>
    </html>
  )
}
