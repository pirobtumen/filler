import { Builder, IBuilders, buildHtml } from "../../src/domain/builder";
import { MemoryCache, ICache } from "../../src/lib/cache";
import { IFile, IBuilderCache } from "../../src/interfaces";
import { defaultConfig } from "../../src/use-cases/build/config.default";

jest.mock("../../src/domain/builder/filetype/html.builder");

describe("Builder", () => {
  let cache: ICache<IBuilderCache>;

  beforeEach(() => {
    const initCache: IBuilderCache = {
      config: defaultConfig,
      templates: {},
      posts: [],
      snippets: {}
    };
    cache = new MemoryCache<IBuilderCache>(initCache);
  });

  test("Build file calls registered builder", async () => {
    const fakeFile: IFile = {
      name: "test",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "fake-file"
    };
    const fakeBuilder = jest.fn(async (cache, file) => {
      return file;
    });
    const builders: IBuilders = {
      html: fakeBuilder
    };

    const builder = new Builder(cache, builders);
    const output = await builder.buildFile(fakeFile);

    expect(output).toMatchObject(fakeFile);
    expect(fakeBuilder).toHaveBeenCalledWith(cache, fakeFile);
  });

  test("Build file calls unregistered builder", async () => {
    const fakeFile: IFile = {
      name: "test",
      extension: "css",
      modifiedAt: new Date(),
      path: "",
      raw: "fake-file"
    };
    const fakeBuilder = jest.fn(async (cache, file) => {
      return file;
    });
    const builders: IBuilders = {
      html: fakeBuilder
    };

    const builder = new Builder(cache, builders);
    const output = await builder.buildFile(fakeFile);

    expect(output).toMatchObject(fakeFile);
    expect(fakeBuilder).not.toHaveBeenCalled();
  });

  test("Build templates", async () => {
    cache.set("config", { ...defaultConfig, postsFolder: "posts" });
    cache.set("templates", {
      main: {
        name: "main",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{content}}</div>"
      },
      post: {
        name: "post",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{content}}</div>"
      }
    });

    const cacheSetSpy = spyOn(cache, "set");
    const builder = new Builder(cache, {});
    await builder.buildTemplates();
    expect(buildHtml).toHaveBeenCalled();
    expect(cacheSetSpy).toHaveBeenCalled();

    const templates = cache.get("templates");
    expect(Object.keys(templates)).toEqual(["main", "post"]);
  });
});
