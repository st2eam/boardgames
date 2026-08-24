type LocalizedText = Record<"en" | "zh", string>;

interface Props {
  src: string;
  alt: string;
  className?: string;
}

/** Shared, base-path-safe figure used by rule markdown and interactive flows. */
export function RuleIllustration({ src, alt, className = "" }: Props) {
  const href =
    src.startsWith("http") || src.startsWith("/boardgames")
      ? src
      : src.startsWith("/")
        ? `/boardgames${src}`
        : src;

  return (
    <figure className={`my-6 ${className}`}>
      <img
        src={href}
        alt={alt}
        className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-white shadow-card"
      />
      {alt ? (
        <figcaption className="mt-2 text-center text-sm text-stone-500">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  );
}

export type { LocalizedText };
