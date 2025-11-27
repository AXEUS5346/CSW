"use client"

import { useEffect, useRef } from "react"

interface LumaEmbedProps {
  url: string
  className?: string
}

export function LumaEmbed({ url, className }: LumaEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Luma embed script if not already loaded
    if (!document.querySelector('script[src*="lu.ma/embed.js"]')) {
      const script = document.createElement("script")
      script.src = "https://embed.lu.ma/embed.js"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // Extract event ID from URL if it's a full Luma URL
  const getEmbedUrl = (inputUrl: string) => {
    if (inputUrl.includes("lu.ma/embed")) {
      return inputUrl
    }
    // Convert lu.ma/event-id to embed URL
    const match = inputUrl.match(/lu\.ma\/([^/?]+)/)
    if (match) {
      return `https://lu.ma/embed/event/${match[1]}/simple`
    }
    return inputUrl
  }

  return (
    <div ref={containerRef} className={className}>
      <iframe
        src={getEmbedUrl(url)}
        width="100%"
        height="450"
        frameBorder="0"
        style={{ border: "1px solid #bfcbda88", borderRadius: "12px" }}
        allowFullScreen
        aria-hidden="false"
        tabIndex={0}
      />
    </div>
  )
}
