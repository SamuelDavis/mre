import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { createSetLike } from "./setLike";

describe("createSetLike", () => {
  it("adds without duplicates, deletes, and toggles", () => {
    const set = createSetLike(createSignal<string[]>([]));
    set.add("a");
    set.add("a");
    set.add("b");
    expect(set.arr()).toEqual(["a", "b"]);
    set.del("a");
    expect(set.has("a")).toBe(false);
    set.toggle("a");
    set.toggle("b");
    expect(set.arr()).toEqual(["a"]);
  });
});
