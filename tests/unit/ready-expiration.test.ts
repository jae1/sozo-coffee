import { describe, expect, it } from "vitest";
import { isVisibleReady } from "@/lib/orders/get-board";

describe("Ready visibility", () => {
  it("hides orders after five minutes", () => {
    const now = Date.parse("2026-06-20T12:05:01Z");
    expect(isVisibleReady("2026-06-20T12:00:00Z", now)).toBe(false);
    expect(isVisibleReady("2026-06-20T12:00:02Z", now)).toBe(true);
  });
});
