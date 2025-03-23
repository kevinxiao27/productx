import type { Metadata } from 'next'
import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css';


export const metadata: Metadata = {
  title: 'Nerve Dashboard',
  description: 'Kevin',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
