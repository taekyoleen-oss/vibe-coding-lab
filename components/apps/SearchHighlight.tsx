interface SearchHighlightProps {
  text: string
  query: string
}

export function SearchHighlight({ text, query }: SearchHighlightProps) {
  if (!query.trim()) return <span>{text}</span>

  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-primary/20 text-primary font-medium rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}
