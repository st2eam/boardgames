import { z } from "zod";

export const wireMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hello"),
    payload: z.object({ playerId: z.string(), name: z.string() }),
  }),
  z.object({
    type: z.literal("lobby"),
    payload: z.unknown(),
  }),
  z.object({
    type: z.literal("action"),
    payload: z.unknown(),
  }),
  z.object({
    type: z.literal("actionReject"),
    payload: z.object({
      clientActionId: z.string().optional(),
      error: z.string(),
    }),
  }),
  z.object({
    type: z.literal("events"),
    payload: z.array(z.unknown()),
  }),
  z.object({
    type: z.literal("view"),
    payload: z.unknown(),
  }),
  z.object({
    type: z.literal("phase"),
    payload: z.object({ phase: z.string() }),
  }),
  z.object({
    type: z.literal("aiPresence"),
    payload: z.unknown(),
  }),
  z.object({
    type: z.literal("chat"),
    payload: z.object({
      playerId: z.string(),
      text: z.string(),
      at: z.number(),
    }),
  }),
  z.object({
    type: z.literal("snapshot"),
    payload: z.unknown(),
  }),
]);

export type WireMessage = z.infer<typeof wireMessageSchema>;

export function parseWireMessage(data: unknown): WireMessage | null {
  const r = wireMessageSchema.safeParse(data);
  return r.success ? r.data : null;
}
