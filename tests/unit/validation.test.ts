import { describe, expect, it } from "vitest";
import { createOrderSchema, pinSchema } from "@/lib/validation/schemas";

describe("validation", () => {
  it("accepts a guest order", () => {
    expect(
      createOrderSchema.safeParse({
        requestId: crypto.randomUUID(),
        identity: { type: "guest", name: "Sam" },
        menuItemId: "latte",
        temperature: "iced",
      }).success,
    ).toBe(true);
  });

  it("requires exactly four PIN digits", () => {
    expect(pinSchema.safeParse({ pin: "1234" }).success).toBe(true);
    expect(pinSchema.safeParse({ pin: "12ab" }).success).toBe(false);
  });
});
