"use client"

import { useActionState, useState } from "react"
import { useTransition } from "react"
import { Loader2, Trash2 } from "lucide-react"
import {
  inviteTeamMemberAction,
  removeMemberAction,
  updateMemberAction,
} from "@/app/admin/actions"
import type { ProfileRow } from "@/lib/admin-types"

export default function TeamPanel({ members }: { members: ProfileRow[] }) {
  return (
    <div className="space-y-7">
      <InviteForm />

      <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-2/60 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="p-4">সদস্য</th>
              <th className="p-4">ভূমিকা</th>
              <th className="hidden p-4 md:table-cell">কী করতে পারবে</th>
              <th className="p-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {members.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function InviteForm() {
  const [state, action, pending] = useActionState(inviteTeamMemberAction, {})

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-card md:p-6">
      <h2 className="mb-4 font-display font-bold">➕ টিমে নতুন কাউকে যোগ করুন</h2>
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <input name="full_name" required placeholder="পুরো নাম" className={input} />
        <input name="email" type="email" required placeholder="ইমেইল" className={input} />
        <input name="password" type="password" required placeholder="পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর)" className={input} />
        <select name="role" defaultValue="moderator" className={input}>
          <option value="moderator">🚚 ডেলিভারি টিম</option>
          <option value="owner">👑 মালিক (সব ক্ষমতা)</option>
        </select>
        <p className="text-xs leading-relaxed text-muted sm:col-span-2">
          🚚 <b>ডেলিভারি টিম</b>: অর্ডার দেখা, স্টেটাস বদলানো (কনফার্ম/পাঠানো/ডেলিভারি) আর স্টক আপডেট।
          দাম, পণ্য, পেমেন্ট যাচাই, সেটিংস আর টিম শুধু মালিকের হাতে।
        </p>
        {state?.error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 sm:col-span-2">{state.error}</p>
        )}
        {state?.success && (
          <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 sm:col-span-2">{state.success}</p>
        )}
        <button
          disabled={pending}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-display font-bold text-on-primary hover:bg-primary-strong disabled:opacity-60 sm:col-span-2 sm:w-fit"
        >
          {pending && <Loader2 size={15} className="animate-spin" />}
          যোগ করুন
        </button>
      </form>
    </section>
  )
}

function MemberRow({ member }: { member: ProfileRow }) {
  const [pending, startTransition] = useTransition()

  const changeRole = (role: string) =>
    startTransition(async () => {
      await updateMemberAction(member.id, {
        role: role as "owner" | "moderator",
        assigned_tenants: member.assigned_tenants,
      })
    })

  return (
    <tr className={pending ? "opacity-50" : ""}>
      <td className="p-4">
        <p className="font-medium">{member.full_name || "—"}</p>
        <p className="text-xs text-muted">
          {member.role === "owner" ? "👑 মালিক" : "🚚 ডেলিভারি টিম"}
        </p>
      </td>
      <td className="p-4">
        <select
          value={member.role}
          onChange={(e) => changeRole(e.target.value)}
          disabled={pending}
          className="rounded-xl border border-line bg-bg px-3 py-2 text-sm"
        >
          <option value="moderator">ডেলিভারি টিম</option>
          <option value="owner">মালিক</option>
        </select>
      </td>
      <td className="hidden p-4 text-xs text-muted md:table-cell">
        {member.role === "owner" ? "সব কিছু" : "অর্ডার + স্টক"}
      </td>
      <td className="p-4 text-right">
        <RemoveButton userId={member.id} />
      </td>
    </tr>
  )
}

function RemoveButton({ userId }: { userId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        aria-label="সরান"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50"
      >
        <Trash2 size={14} className="text-muted" />
      </button>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await removeMemberAction(userId)
          })
        }
        className="rounded-full bg-red-500 px-2.5 py-1.5 text-white"
      >
        {pending ? "..." : "নিশ্চিত?"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-muted">
        ✕
      </button>
    </span>
  )
}

const input =
  "w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
