export default function SectionHeading({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow?: string;
}) {
  return (
    <div className="space-y-1.5">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="section-title gradient-text text-3xl md:text-[2rem]">{title}</h2>
      <div className="gold-rule w-16" />
    </div>
  );
}
