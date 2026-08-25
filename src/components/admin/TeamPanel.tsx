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
              <th className="hidden p-4 md:table-cell">যে শপগুলো দেখবে</th>
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
      <h2 className="mb-4 font-display font-bold">➕ নতুন অ্যাডমিন যোগ করুন</h2>
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <input name="full_name" required placeholder="পুরো নাম" className={input} />
        <input name="email" type="email" required placeholder="ইমেইল" className={input} />
        <input name="password" type="password" required placeholder="পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর)" className={input} />
        <select name="role" defaultValue="moderator" className={input}>
          <option value="moderator">🛡️ মডারেটর</option>
          <option value="owner">👑 মালিক (সব ক্ষমতা)</option>
        </select>
        <fieldset className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <legend className="mb-1.5 w-full text-xs font-semibold text-muted">
            কোন শপ পরিচালনা করতে পারবে?
          </legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="tenants" value="oddbox" defaultChecked className="h-4 w-4 accent-[var(--primary)]" />
            🎁 অডবক্স
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="tenants" value="mithai" defaultChecked className="h-4 w-4 accent-[var(--primary)]" />
            🍯 মিষ্টি বাংলা
          </label>
        </fieldset>
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

  const toggleTenant = (tenant: string) => {
    const next = member.assigned_tenants.includes(tenant)
      ? member.assigned_tenants.filter((t) => t !== tenant)
      : [...member.assigned_tenants, tenant]
    startTransition(async () => {
      await updateMemberAction(member.id, {
        assigned_tenants: next.length ? next : member.assigned_tenants,
      })
    })
  }

  return (
    <tr className={pending ? "opacity-50" : ""}>
      <td className="p-4">
        <p className="font-medium">{member.full_name || "—"}</p>
        <p className="text-xs text-muted">
          {member.role === "owner" ? "👑 মালিক" : "🛡️ মডারেটর"}
        </p>
      </td>
      <td className="p-4">
        <select
          value={member.role}
          onChange={(e) => changeRole(e.target.value)}
          disabled={pending}
          className="rounded-xl border border-line bg-bg px-3 py-2 text-sm"
        >
          <option value="moderator">মডারেটর</option>
          <option value="owner">মালিক</option>
        </select>
      </td>
      <td className="hidden p-4 md:table-cell">
        <div className="flex gap-4">
          {["oddbox", "mithai"].map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={member.assigned_tenants.includes(t)}
                onChange={() => toggleTenant(t)}
                disabled={pending || member.role === "owner"}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              {t === "oddbox" ? "🎁 অডবক্স" : "🍯 মিষ্টি"}
            </label>
          ))}
        </div>
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
