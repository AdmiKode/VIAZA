export async function translateText(params: { text: string; from: string; to: string }) {
  const { text, to } = params;
  const cleaned = text.trim();
  if (!cleaned) return '';
  await new Promise((r) => setTimeout(r, 150));
  return `${cleaned} (${to})`;
}

