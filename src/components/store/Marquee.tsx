export default function Marquee({ jokes }: { jokes: string[] }) {
  if (jokes.length === 0) return null
  const doubled = [...jokes, ...jokes]
  return (
    <div className="relative overflow-hidden border-y border-line bg-surface py-3">
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {doubled.map((joke, i) => (
          <span key={i} className="font-display text-sm font-semibold text-muted">
            {joke}
          </span>
        ))}
      </div>
    </div>
  )
}
