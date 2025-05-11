import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AbroadDesk Billing System',
  description: 'Created with Abishkar',
  generator: 'Abishkar',
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
