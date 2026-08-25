export default function SectionHeading({
  title,
  sub,
  center = true,
}: {
  title: string
  sub?: string
  center?: boolean
}) {
  return (
    <div className={`mb-7 ${center ? "text-center" : ""}`}>
      <h2 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{title}</h2>
      {sub && <p className="mt-2 text-sm text-muted md:text-base">{sub}</p>}
    </div>
  )
}
