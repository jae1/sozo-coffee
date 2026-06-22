import { describe, expect, it } from "vitest";
import {
  memberLoginSchema,
  memberRecoverySchema,
  memberSignupSchema,
} from "@/lib/validation/schemas";

describe("member auth validation", () => {
  it("accepts a valid signup", () => {
    expect(memberSignupSchema.safeParse({
      displayName: "재원",
      username: "jaewon_1",
      pin: "123456",
      pinConfirm: "123456",
      inviteCode: "invite",
    }).success).toBe(true);
  });

  it("rejects weak usernames and PIN mismatches", () => {
    expect(memberSignupSchema.safeParse({
      displayName: "재원",
      username: "J!",
      pin: "123456",
      pinConfirm: "654321",
      inviteCode: "invite",
    }).success).toBe(false);
  });

  it("validates login and recovery PINs", () => {
    expect(memberLoginSchema.safeParse({ username: "jaewon", pin: "123456" }).success).toBe(true);
    expect(memberLoginSchema.safeParse({ username: "jaewon", pin: "1234" }).success).toBe(false);
    expect(memberRecoverySchema.safeParse({
      username: "jaewon",
      recoveryCode: "A1B2C3D4E5F6",
      newPin: "654321",
      newPinConfirm: "654321",
    }).success).toBe(true);
  });
});
