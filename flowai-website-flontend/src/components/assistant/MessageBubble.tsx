import CitationChip from "./CitationChip";

function extractCitations(content: string) {
  return [...content.matchAll(/\[Source: ([^\]]+)\]/g)].map((match) => match[1]);
}

export default function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant" | "system";
  content: string;
}) {
  const citations = extractCitations(content);
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          mine ? "bg-brand-600 text-white" : "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {citations.length ? (
          <div className="mt-2">
            {citations.map((citation) => (
              <CitationChip key={citation} label={citation} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
