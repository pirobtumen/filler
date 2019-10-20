import marked from "marked";
import { htmlBuilder } from "../../src/domain/builder/builders/html.builder";

import { Store } from "../../src/lib/store";
import { IFile } from "../../src/interfaces";
import { markdownBuilder } from "../../src/domain/builder/builders/markdown.builder";

jest.mock("../../src/domain/builder/builders/html.builder.ts");
jest.mock("marked", () => ({
  parse: jest.fn((markdown: string, callback: any) =>
    callback(null, "html-output")
  )
}));

const mockedMarked = marked as jest.Mocked<typeof marked>;

describe("Builder - Markdown", () => {
  test("parseMarkdown and htmlBuilder are called", async () => {
    const store = new Store();
    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main\n-->\n # Hey\nHi"
    };

    await markdownBuilder(store, fakeFile);
    expect(marked.parse).toHaveBeenCalledWith(
      fakeFile.raw,
      expect.any(Function)
    );
    expect(htmlBuilder).toHaveBeenCalledWith(store, {
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
    const store = new Store();
    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main\n-->\n # Hey\nHi"
    };

    return expect(markdownBuilder(store, fakeFile)).rejects.toThrow(
      new Error("Markdown error")
    );
  });
});
