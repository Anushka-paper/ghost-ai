import { Liveblocks } from '@liveblocks/node';

// Fixed palette of cursor colors
const CURSOR_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B88B', // Peach
  '#A8E6CF', // Green
];

/**
 * Cached Liveblocks client for server-side operations
 */
let liveblocks: Liveblocks | null = null;

export function getLiveblocks(): Liveblocks {
  if (!liveblocks) {
    if (!process.env.LIVEBLOCKS_SECRET_KEY) {
      throw new Error('LIVEBLOCKS_SECRET_KEY is not defined');
    }
    liveblocks = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY,
    });
  }
  return liveblocks;
}

/**
 * Deterministically map a user ID to a consistent cursor color
 */
export function getUserCursorColor(userId: string): string {
  const hash = userId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}
