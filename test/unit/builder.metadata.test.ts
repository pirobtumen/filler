import { getFileMetadata } from "../../src/domain/builder";
import { IFile } from "../../src/interfaces";

describe("Builder - Metadata", () => {
  test("Parse template file", () => {
    const file: IFile = {
      name: "article.html",
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
      -->"
    };
    const { metadata } = getFileMetadata(file);
    expect(metadata).toMatchObject({
      template: "main",
      a: "1234",
      b: "abcdef",
      c: "12-12-2019",
      d: "hi. \"m,y #(n4-m3)!¡?¿ i's Alberto;"
    });
  });

  test("Parse template file (multi line spaces)", () => {
    const file: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw:
        "    <!--\n\
      @template main\n\
      @a 1234\n\
      @b abcdef\n\
      @c 12-12-2019\n\
      -->"
    };
    const { metadata } = getFileMetadata(file);
    expect(metadata).toMatchObject({
      template: "main",
      a: "1234",
      b: "abcdef",
      c: "12-12-2019"
    });
  });

  test("Parse template file (error not started)", () => {
    const file: IFile = {
      name: "article.html",
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
      name: "article.html",
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
      name: "article.html",
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
