import { getFileMetadata } from "../../src/lib/builder";

describe("Builder", () => {
  test("Get template metadata (single line)", () => {
    const file = "<!-- @template main @a 1234 @b abcdef @c 12-12-2019 -->";
    const { metadata } = getFileMetadata(file);
    expect(metadata).toMatchObject({
      template: "main",
      a: "1234",
      b: "abcdef",
      c: "12-12-2019"
    });
  });

  test("Parse template file (multi line)", () => {
    const file =
      "<!--\n\
    @template main\n\
    @a 1234\n\
    @b abcdef\n\
    @c 12-12-2019\n\
    -->";
    const { metadata } = getFileMetadata(file);
    expect(metadata).toMatchObject({
      template: "main",
      a: "1234",
      b: "abcdef",
      c: "12-12-2019"
    });
  });

  test("Parse template file (multi line spaces)", () => {
    const file =
      "    <!--\n\
    @template main\n\
    @a 1234\n\
    @b abcdef\n\
    @c 12-12-2019\n\
    -->";
    const { metadata } = getFileMetadata(file);
    expect(metadata).toMatchObject({
      template: "main",
      a: "1234",
      b: "abcdef",
      c: "12-12-2019"
    });
  });

  test("Parse template file (error not started)", () => {
    const file =
      "\n\
    @template main\n\
    @a 1234\n\
    @b abcdef\n\
    @c 12-12-2019\n\
    -->";
    expect(() => getFileMetadata(file)).toThrow();
  });

  test("Parse template file (error not ended)", () => {
    const file =
      "    <!--\n\
    @template main\n\
    @a 1234\n\
    @b abcdef\n\
    @c 12-12-2019\n\
    ";
    expect(() => getFileMetadata(file)).toThrow();
  });

  test("Parse template file (error reversed)", () => {
    const file =
      "  -->  <!--\n\
    @template main\n\
    @a 1234\n\
    @b abcdef\n\
    @c 12-12-2019\n\
    ";
    expect(() => getFileMetadata(file)).toThrowError();
  });
});
