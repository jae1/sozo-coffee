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
  pushSubscription: z.object({
    endpoint: z.string().url(),
    expirationTime: z.number().nullable().optional(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }).nullable().optional(),
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

const usernameSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,20}$/);
const memberPinSchema = z.string().regex(/^\d{6}$/);

export const memberSignupSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  username: usernameSchema,
  pin: memberPinSchema,
  pinConfirm: memberPinSchema,
  inviteCode: z.string().min(1),
}).refine((value) => value.pin === value.pinConfirm, {
  message: "PIN confirmation does not match.",
  path: ["pinConfirm"],
});

export const memberLoginSchema = z.object({
  username: usernameSchema,
  pin: memberPinSchema,
});

export const memberRecoverySchema = z.object({
  username: usernameSchema,
  recoveryCode: z.string().trim().min(8).max(32),
  newPin: memberPinSchema,
  newPinConfirm: memberPinSchema,
}).refine((value) => value.newPin === value.newPinConfirm, {
  message: "PIN confirmation does not match.",
  path: ["newPinConfirm"],
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
