export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

export function generateRoomId(name: string): string {
  const slug = generateSlug(name);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${suffix}`;
}
