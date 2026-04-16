export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-1">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300/70">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white">
        {title}
      </h2>
      {subtitle ? <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p> : null}
    </div>
  );
}
