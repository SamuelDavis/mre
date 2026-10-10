import { describe, expect, it } from "vitest";
import { createLimiter } from "./limiter";

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}

describe("createLimiter", () => {
  it("never exceeds the concurrency limit", async () => {
    const limit = createLimiter(2);
    let active = 0;
    let peak = 0;
    const gates = Array.from({ length: 5 }, deferred);
    const results = gates.map((gate, i) =>
      limit(async () => {
        peak = Math.max(peak, ++active);
        await gate.promise;
        active--;
        return i;
      }),
    );
    for (const gate of gates) {
      await Promise.resolve();
      gate.resolve();
    }
    expect(await Promise.all(results)).toEqual([0, 1, 2, 3, 4]);
    expect(peak).toBe(2);
  });

  it("propagates rejections and keeps draining", async () => {
    const limit = createLimiter(1);
    const failed = limit(() => Promise.reject(new Error("boom")));
    const next = limit(() => Promise.resolve("ok"));
    await expect(failed).rejects.toThrow("boom");
    await expect(next).resolves.toBe("ok");
  });
});
