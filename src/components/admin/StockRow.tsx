"use client"

import { useState, useTransition } from "react"
import { Check, Loader2 } from "lucide-react"
import { setStockAction } from "@/app/admin/actions"

export default function StockRow({
  id,
  title,
  image,
  stock,
  inactive,
}: {
  id: string
  title: string
  image: string | null
  stock: number | null
  inactive: boolean
}) {
  const initial = stock === null ? "" : String(stock)
  const [value, setValue] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  const dirty = value !== saved

  const save = () =>
    startTransition(async () => {
      setError(null)
      const next = value.trim() === "" ? null : Number(value)
      const res = await setStockAction(id, next)
      if (res.ok) {
        setSaved(value)
        setDone(true)
        setTimeout(() => setDone(false), 1500)
      } else {
        setError(res.error ?? "সমস্যা হয়েছে")
      }
    })

  const n = saved === "" ? null : Number(saved)

  return (
    <li className="flex items-center gap-3 px-5 py-3">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">
          {inactive
            ? "বন্ধ করা আছে"
            : n === null
              ? "আনলিমিটেড"
              : n === 0
                ? "🔴 স্টক শেষ"
                : n <= 10
                  ? "🟠 কমে যাচ্ছে"
                  : "🟢 যথেষ্ট আছে"}
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
        inputMode="numeric"
        placeholder="∞"
        aria-label={`${title} স্টক`}
        className="w-20 rounded-xl border border-line bg-bg px-3 py-2 text-center text-sm font-bold outline-none focus:border-primary"
      />
      <button
        onClick={save}
        disabled={!dirty || pending}
        className="flex h-9 w-16 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary disabled:bg-surface-2 disabled:text-muted"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : done ? <Check size={15} /> : "সেভ"}
      </button>
    </li>
  )
}
