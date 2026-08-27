"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface Props {
  images: string[]
  alt: string
}

export default function ProductImageCarousel({ images, alt }: Props) {
  const [current, setCurrent] = useState(0)
  const single = images.length <= 1

  const goTo = (idx: number) => {
    setCurrent(idx)
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface-2 shadow-card">
      {/* Image strip */}
      <motion.div
        drag={single ? undefined : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        animate={{ x: `-${current * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex touch-pan-y"
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="w-full flex-shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="aspect-square w-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </motion.div>

      {/* Empty state */}
      {images.length === 0 && (
        <div className="flex aspect-square w-full items-center justify-center bg-surface-2">
          <span className="text-5xl">📸</span>
        </div>
      )}

      {/* Dot indicators */}
      {!single && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`ছবি ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? "w-6 bg-primary"
                  : "w-2 bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* Swipe hint */}
      {images.length > 1 && current === 0 && (
        <motion.span
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute bottom-10 right-4 text-xs font-medium text-white/80 drop-shadow"
        >
          ← সোয়াইপ করুন →
        </motion.span>
      )}
    </div>
  )
}
