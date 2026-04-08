interface HighlightProps {
  text: string;
  query: string;
  activeClassName?: string;
}

export function HighlightText({
  text,
  query,
  activeClassName = 'bg-sky-500/40 text-sky-100 ring-1 ring-sky-500/30 rounded-sm px-0.5',
}: HighlightProps) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <>
      {parts.map((part, i) => {
        const key = `part-${i}-${part}`;

        return part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={key}
            className={`bg-transparent no-underline ${activeClassName}`}
          >
            {part}
          </mark>
        ) : (
          <span key={key}>{part}</span>
        );
      })}
    </>
  );
}
