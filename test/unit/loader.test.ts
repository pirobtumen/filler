import { Loader } from "../../src/domain/loader";
import { MemoryCache, ICache } from "../../src/lib/cache";
import { IConfig, IFile, IBuilderCache } from "../../src/interfaces";
import { defaultConfig } from "../../src/use-cases/build/config.default";

describe("Loader", () => {
  let cache: ICache<IBuilderCache>;

  beforeEach(() => {
    const initCache: IBuilderCache = {
      config: {
        ...defaultConfig,
        projectFolder: "./test/data/project",
        distFolder: "./test/dist"
      },
      templates: {},
      posts: [],
      snippets: {}
    };
    cache = new MemoryCache<IBuilderCache>(initCache);
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

    // Workaround for CI/CD file modified at date
    // TODO Test date inside dir-scanner and mock it here
    const now = new Date();
    cache.get("templates").main.modifiedAt = now;

    expect(cache.get("templates")).toMatchObject({
      main: {
        name: "main",
        extension: "html",
        path: "",
        modifiedAt: now,
        raw: Buffer.from(
          "3c6469763e0a20207b7b636f6e74656e747d7d0a3c2f6469763e",
          "hex"
        )
      }
    });

    expect(cache.get("snippets")).toMatchObject({
      analytics: {
        configMode: "prod",
        value: '<script>\n  const a = "I am an analytic script!";\n</script>'
      },
      scripts: {
        configMode: "all",
        value: '<script>\n  const a = "I am an script!";\n</script>'
      }
    });

    expect(
      cache
        .get("posts")
        .every(
          (p: IFile) =>
            ["first", "second", "third", "fourth", "subfolder"].indexOf(
              p.name
            ) > -1
        )
    ).toBeTruthy();
  });
});
