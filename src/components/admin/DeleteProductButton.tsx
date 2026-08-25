"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { deleteProductAction } from "@/app/admin/actions"

export default function DeleteProductButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        aria-label="মুছুন"
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50"
      >
        <Trash2 size={14} className="text-muted hover:text-red-500" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteProductAction(id)
            setConfirming(false)
          })
        }
        className="rounded-full bg-red-500 px-2.5 py-1.5 text-white"
      >
        {pending ? "..." : "নিশ্চিত?"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-muted hover:text-ink">
        ✕
      </button>
    </div>
  )
}
