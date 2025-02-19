import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AnimatedBackground from "@/components/AnimatedBackground"
import CursorFollower from "@/components/CursorFollower"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Interactive 3D Background",
  description: "A Next.js app with Three.js interactive background and cursor follower",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <AnimatedBackground />
        <CursorFollower />
        {children}
      </body>
    </html>
  )
}



import './globals.css'