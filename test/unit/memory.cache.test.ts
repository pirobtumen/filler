import { MemoryCache, ICache } from "../../src/lib/cache";

interface ITest {
  name: string;
}

describe("MemoryCache", () => {
  let cache: ICache<ITest>;

  beforeEach(() => {
    const initCache: ITest = {
      name: ""
    };
    cache = new MemoryCache<ITest>(initCache);
  });

  test("Set/Get keys", () => {
    cache.set("name", "hii");
    expect(cache.get("name")).toBe("hii");
  });
});
