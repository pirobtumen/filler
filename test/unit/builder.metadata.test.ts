import { getFileMetadata } from "../../src/domain/builder";
import { IFile } from "../../src/interfaces";

describe("Builder - Metadata", () => {
  test("Parse template file", () => {
    const file: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw:
        "<!--\n\
      @template main\n\
      @a 1234\n\
      @b abcdef\n\
      @c 12-12-2019\n\
      @d hi. \"m,y #(n4-m3)!¡?¿ i's Alberto;\n\
      -->my-content"
    };
    const { metadata, html } = getFileMetadata(file);
    expect(metadata).toMatchObject({
      template: "main",
      a: "1234",
      b: "abcdef",
      c: "12-12-2019",
      d: "hi. \"m,y #(n4-m3)!¡?¿ i's Alberto;"
    });
    expect(html).toEqual("my-content");
  });

  test("Parse template file (multi line spaces)", () => {
    const file: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw:
        "    <!--\n\
      @template main\n\
      @a 1234\n\
      @b abcdef\n\
      @c 12-12-2019\n\
      --> my-content"
    };
    const { metadata, html } = getFileMetadata(file);
    expect(metadata).toMatchObject({
      template: "main",
      a: "1234",
      b: "abcdef",
      c: "12-12-2019"
    });
    expect(html).toEqual(" my-content");
  });

  test("Parse template file without metadata", () => {
    const file: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "my-content"
    };
    const { metadata, html } = getFileMetadata(file);
    expect(metadata).toMatchObject({});
    expect(html).toEqual("my-content");
  });

  test("Parse template file (error not started)", () => {
    const file: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw:
        "\n\
      @template main\n\
      @a 1234\n\
      @b abcdef\n\
      @c 12-12-2019\n\
      -->"
    };
    expect(() => getFileMetadata(file)).toThrow();
  });

  test("Parse template file (error not ended)", () => {
    const file: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw:
        "    <!--\n\
      @template main\n\
      @a 1234\n\
      @b abcdef\n\
      @c 12-12-2019\n\
      "
    };
    expect(() => getFileMetadata(file)).toThrow();
  });

  test("Parse template file (error reversed)", () => {
    const file: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw:
        "  -->  <!--\n\
      @template main\n\
      @a 1234\n\
      @b abcdef\n\
      @c 12-12-2019\n\
      "
    };
    expect(() => getFileMetadata(file)).toThrowError();
  });
});
