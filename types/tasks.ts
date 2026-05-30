import { z } from "zod";

// Schema for ai-status-feed
export const aiStatusFeedPayloadSchema = z.object({
  text: z.string().optional(),
});

export type AiStatusFeedPayload = z.infer<typeof aiStatusFeedPayloadSchema>;

export function validateAiStatusMessage(data: unknown): AiStatusFeedPayload | null {
  const result = aiStatusFeedPayloadSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return null;
}

// Schema for ai-chat feed
export const aiChatMessagePayloadSchema = z.object({
  sender: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
});

export type AiChatMessagePayload = z.infer<typeof aiChatMessagePayloadSchema>;

export function validateAiChatMessage(data: unknown): AiChatMessagePayload | null {
  const result = aiChatMessagePayloadSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return null;
}
