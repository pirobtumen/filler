import { Loader } from "../../src/domain/loader";
import { MemoryCache } from "../../src/lib/cache";
import { ICache, IConfig, IFile } from "../../src/interfaces";
import { defaultConfig } from "../../src/use-cases/build/config.default";

describe("Loader", () => {
  let cache: ICache;

  beforeEach(() => {
    cache = new MemoryCache();
    cache.set("config", {
      ...defaultConfig,
      projectFolder: "./test/data/project",
      distFolder: "./test/dist"
    } as IConfig);
  });

  test("Folder doesn't exist", async () => {
    cache.set("config", {
      ...cache.get("config"),
      projectFolder: "./test/data/empty-project"
    } as IConfig);

    const loader = new Loader(cache);
    await loader.init();

    expect(cache.get("templates")).toEqual({});
    expect(cache.get("snippets")).toEqual({});
    expect(cache.get("posts")).toEqual([]);
  });

  test("Folder is empty", async () => {
    cache.set("config", {
      ...cache.get("config"),
      projectFolder: "./test/data/empty-project"
    } as IConfig);

    const loader = new Loader(cache);
    await loader.init();

    expect(cache.get("templates")).toEqual({});
    expect(cache.get("snippets")).toEqual({});
    expect(cache.get("posts")).toEqual([]);
  });

  test("Folder is correct", async () => {
    cache.set("config", {
      ...cache.get("config"),
      projectFolder: "./test/data/project"
    } as IConfig);

    const loader = new Loader(cache);
    await loader.init();

    expect(Object.keys(cache.get("templates"))).toMatchObject(["main"]);
    expect(Object.keys(cache.get("snippets"))).toEqual([
      "analytics",
      "scripts"
    ]);
    expect(
      cache
        .get("posts")
        .every(
          (p: IFile) =>
            ["first.html", "second.html", "third.html", "fourth.html"].indexOf(
              p.name
            ) > -1
        )
    ).toBeTruthy();
  });
});
