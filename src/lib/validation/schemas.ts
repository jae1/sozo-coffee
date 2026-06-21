import { z } from "zod";

const memberIdentity = z.object({
  type: z.literal("member"),
  memberId: z.string().uuid(),
});

const guestIdentity = z.object({
  type: z.literal("guest"),
  name: z.string().trim().min(1).max(40),
});

export const createOrderSchema = z.object({
  requestId: z.string().uuid(),
  identity: z.discriminatedUnion("type", [memberIdentity, guestIdentity]),
  menuItemId: z.enum(["americano", "latte", "mocha"]),
  temperature: z.enum(["hot", "iced"]),
  note: z.string().trim().max(120).optional().default(""),
});

export const pinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/),
});

export const closeSessionSchema = z.object({
  action: z.literal("close"),
  confirmActiveOrders: z.boolean().default(false),
});

export const statusTransitionSchema = z.object({
  from: z.enum(["ordered", "in_progress", "ready"]),
  to: z.enum(["ordered", "in_progress", "ready"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
