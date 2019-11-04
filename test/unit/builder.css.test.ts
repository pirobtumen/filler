jest.mock("uglifycss");
import { processString } from "uglifycss";

import { MemoryCache, ICache } from "../../src/lib/cache";
import { IFile, IBuilderCache } from "../../src/interfaces";
import { buildCss } from "../../src/domain/builder";
import { defaultConfig } from "../../src/use-cases/build/config.default";

describe("Builder - CSS", () => {
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

  test("Uglify css", async () => {
    const fakeFile: IFile = {
      name: "style",
      extension: "css",
      modifiedAt: new Date(),
      path: "",
      raw: "hello { fake-css: 1234; }"
    };

    await buildCss(cache, fakeFile);
    expect(processString).toHaveBeenCalled();
  });
});
