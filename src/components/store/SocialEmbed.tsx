"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

function loadInstagramScript() {
  if (typeof window === "undefined") return
  if (window.instgrm) {
    window.instgrm.Embeds.process()
    return
  }
  if (document.getElementById("ig-embed-js")) return
  const s = document.createElement("script")
  s.id = "ig-embed-js"
  s.async = true
  s.src = "https://www.instagram.com/embed.js"
  document.body.appendChild(s)
}

/** Embeds one Instagram reel/post or Facebook reel/video by URL. */
export default function SocialEmbed({
  platform,
  url,
}: {
  platform: "instagram" | "facebook"
  url: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (platform === "instagram") loadInstagramScript()
  }, [platform, url])

  if (platform === "facebook") {
    return (
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <iframe
          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=320`}
          title="Facebook reel"
          className="aspect-[9/16] w-full"
          style={{ border: "none", overflow: "hidden" }}
          scrolling="no"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          loading="lazy"
        />
      </div>
    )
  }

  const clean = url.split("?")[0]
  return (
    <div ref={ref} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card [&_iframe]:!min-w-0">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={clean}
        data-instgrm-version="14"
        style={{ margin: 0, width: "100%", minWidth: 0, border: 0 }}
      >
        <a href={clean} target="_blank" rel="noopener noreferrer" className="block p-6 text-center text-sm text-muted">
          Instagram-এ দেখুন →
        </a>
      </blockquote>
    </div>
  )
}
