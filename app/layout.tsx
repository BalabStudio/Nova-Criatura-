import React from "react"
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nova Criatura',
  description: 'Sorteie uma função por clique.',
  icons: {
    icon: '/favicon.ico', // favicon padrão
    shortcut: '/favicon.ico', // atalho para alguns browsers
    apple: '/favicon.ico', // fallback para Apple Touch Icon (embora o ideal seja um png específico)
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
