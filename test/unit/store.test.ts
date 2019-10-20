import { Store } from "../../src/lib/store";

describe("Store", () => {
  test("Set/Get keys", () => {
    const store = new Store();
    store.set("test", "hello");
    expect(store.get("test")).toBe("hello");
  });
});
