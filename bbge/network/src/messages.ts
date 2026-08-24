import { z } from "zod";

/** Game-agnostic v2 room protocol. State packets are atomic to avoid races. */
export const ROOM_PROTOCOL_VERSION = 2 as const;

const roomPhaseSchema = z.enum(["lobby", "playing", "finished"]);
const stateSyncSchema = z.object({
  revision: z.number().int().nonnegative(),
  phase: roomPhaseSchema,
  lobby: z.unknown(),
  view: z.unknown().nullable(),
  chat: z.array(z.unknown()).optional(),
  events: z.array(z.unknown()).optional(),
});

export type RoomStateSync = z.infer<typeof stateSyncSchema>;

export const wireMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("joinRequest"),
    protocolVersion: z.literal(ROOM_PROTOCOL_VERSION),
    payload: z.object({ name: z.string().max(80), resumeToken: z.string().min(12).max(256).optional() }),
  }),
  z.object({
    type: z.literal("joinAccepted"),
    protocolVersion: z.literal(ROOM_PROTOCOL_VERSION),
    payload: z.object({ playerId: z.string(), resumeToken: z.string().min(12), state: stateSyncSchema }),
  }),
  z.object({
    type: z.literal("joinRejected"),
    protocolVersion: z.literal(ROOM_PROTOCOL_VERSION),
    payload: z.object({
      code: z.enum(["room-full", "match-in-progress", "protocol-mismatch", "invalid-resume", "room-unavailable"]),
      error: z.string(),
    }),
  }),
  z.object({ type: z.literal("stateSync"), protocolVersion: z.literal(ROOM_PROTOCOL_VERSION), payload: stateSyncSchema }),
  z.object({
    type: z.literal("actionRequest"),
    protocolVersion: z.literal(ROOM_PROTOCOL_VERSION),
    payload: z.object({ clientActionId: z.string().min(1).max(160), action: z.object({ type: z.string().min(1), payload: z.unknown() }) }),
  }),
  z.object({
    type: z.literal("actionAccepted"),
    protocolVersion: z.literal(ROOM_PROTOCOL_VERSION),
    payload: z.object({ clientActionId: z.string(), revision: z.number().int().nonnegative() }),
  }),
  z.object({
    type: z.literal("actionRejected"),
    protocolVersion: z.literal(ROOM_PROTOCOL_VERSION),
    payload: z.object({ clientActionId: z.string(), error: z.string() }),
  }),
  z.object({
    type: z.literal("chatRequest"),
    protocolVersion: z.literal(ROOM_PROTOCOL_VERSION),
    payload: z.object({ text: z.string().min(1).max(1000), at: z.number().finite() }),
  }),
  z.object({
    type: z.literal("chatSync"),
    protocolVersion: z.literal(ROOM_PROTOCOL_VERSION),
    payload: z.object({ playerId: z.string(), text: z.string(), at: z.number().finite() }),
  }),
  z.object({ type: z.literal("aiPresence"), protocolVersion: z.literal(ROOM_PROTOCOL_VERSION), payload: z.unknown() }),
]);

export type WireMessage = z.infer<typeof wireMessageSchema>;

export function parseWireMessage(data: unknown): WireMessage | null {
  const r = wireMessageSchema.safeParse(data);
  return r.success ? r.data : null;
}
