import marked from "marked";

import { MemoryCache, ICache } from "../../src/lib/cache";
import { IFile, IBuilderCache } from "../../src/interfaces";
import { buildHtml, markdownBuilder } from "../../src/domain/builder";
import { defaultConfig } from "../../src/use-cases/build/config.default";

jest.mock("../../src/domain/builder/filetype/html.builder.ts");
jest.mock("marked", () => ({
  parse: jest.fn((markdown: string, callback: any) =>
    callback(null, "html-output")
  )
}));

const mockedMarked = marked as jest.Mocked<typeof marked>;

describe("Builder - Markdown", () => {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("parseMarkdown and htmlBuilder are called", async () => {
    const fakeFile: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main\n-->\n # Hey\nHi"
    };

    await markdownBuilder(cache, fakeFile);
    expect(marked.parse).toHaveBeenCalledWith(
      fakeFile.raw,
      expect.any(Function)
    );
    expect(buildHtml).toHaveBeenCalledWith(cache, {
      ...fakeFile,
      raw: "html-output"
    });
  });

  test("parseMarkdown throws error", async () => {
    mockedMarked.parse.mockImplementation(
      jest.fn((markdown: string, callback: any) =>
        callback(new Error("Markdown error"), null)
      )
    );

    const fakeFile: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main\n-->\n # Hey\nHi"
    };

    return expect(markdownBuilder(cache, fakeFile)).rejects.toThrow(
      new Error("Markdown error")
    );
  });
});
