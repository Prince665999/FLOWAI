const sourcePattern = /\[Source:\s*[^,\]]+,\s*section\s*[^\]]+\]/gi;

export function formatAiResponse(content: string): string {
  return content
    .replace(sourcePattern, "")
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[\w-]*/g, ""))
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!?\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/^\s*#{1,6}\s*/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/^\s*\|\s*/gm, "")
    .replace(/\s*\|\s*/g, " ")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
