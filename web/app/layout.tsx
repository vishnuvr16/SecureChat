import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Private Chat - Encrypted Messaging",
  description: "End-to-end encrypted messaging with QR login. Your messages, your keys.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔒</text></svg>",
  },
  openGraph: {
    title: "Private Chat - Encrypted Messaging",
    description: "End-to-end encrypted messaging with QR login. Your messages, your keys.",
    siteName: "Private Chat",
    images: [
      {
        url: "https://privatechat.example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Private Chat",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
