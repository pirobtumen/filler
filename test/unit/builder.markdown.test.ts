import marked from "marked";

import { MemoryCache } from "../../src/lib/cache";
import { IFile } from "../../src/interfaces";
import { buildHtml, markdownBuilder } from "../../src/domain/builder";

jest.mock("../../src/domain/builder/filetype/html.builder.ts");
jest.mock("marked", () => ({
  parse: jest.fn((markdown: string, callback: any) =>
    callback(null, "html-output")
  )
}));

const mockedMarked = marked as jest.Mocked<typeof marked>;

describe("Builder - Markdown", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("parseMarkdown and htmlBuilder are called", async () => {
    const cache = new MemoryCache();
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
    const cache = new MemoryCache();
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
