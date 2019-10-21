import { MemoryCache } from "../../src/lib/cache";

describe("MemoryCache", () => {
  test("Set/Get keys", () => {
    const cache = new MemoryCache();
    cache.set("test", "hello");
    expect(cache.get("test")).toBe("hello");
  });
});
