import { Loader } from "../../src/lib/filler";
import { Store } from "../../src/lib/store";
import { IStore, IConfig, IFile } from "../../src/lib/interfaces";
import { defaultConfig } from "../../src/config.default";

describe("Loader", () => {
  let store: IStore;

  beforeEach(() => {
    store = new Store();
    store.set("config", {
      ...defaultConfig,
      projectFolder: "./test/data/project",
      distFolder: "./test/dist"
    } as IConfig);
  });

  test("Folder doesn't exist", async () => {
    store.set("config", {
      ...store.get("config"),
      projectFolder: "./test/data/empty-project"
    } as IConfig);

    const loader = new Loader(store);
    await loader.init();

    expect(store.get("templates")).toEqual({});
    expect(store.get("vars")).toEqual({});
    expect(store.get("posts")).toEqual([]);
  });

  test("Folder is empty", async () => {
    store.set("config", {
      ...store.get("config"),
      projectFolder: "./test/data/empty-project"
    } as IConfig);

    const loader = new Loader(store);
    await loader.init();

    expect(store.get("templates")).toEqual({});
    expect(store.get("vars")).toEqual({});
    expect(store.get("posts")).toEqual([]);
  });

  test("Folder is correct", async () => {
    store.set("config", {
      ...store.get("config"),
      projectFolder: "./test/data/project"
    } as IConfig);

    const loader = new Loader(store);
    await loader.init();

    expect(Object.keys(store.get("templates"))).toMatchObject(["main"]);
    expect(Object.keys(store.get("vars"))).toEqual(["analytics", "scripts"]);
    expect(store.get("posts").map((p: IFile) => p.name)).toEqual([
      "first.html",
      "second.html"
    ]);
  });
});