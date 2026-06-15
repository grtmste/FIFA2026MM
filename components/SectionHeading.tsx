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
      <h2 className="section-title text-3xl text-navy md:text-[2rem]">{title}</h2>
      <div className="h-px w-16 bg-gold/60" />
    </div>
  );
}
