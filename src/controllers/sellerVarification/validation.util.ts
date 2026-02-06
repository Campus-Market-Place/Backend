export function extractStudentId(text: string): string | null {
  const match = text.match(/(ETS|ET|ENG)\d{3,5}\/\d{2}/);
  return match ? match[0] : null;
}

export function extractName(text: string): string | null {
  const match = text.match(/Full Name\s+([A-Z\s]+)/i);
  return match && match[1] ? match[1].trim() : null;
}
