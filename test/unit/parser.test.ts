import { getFileMetadata } from "../../src/lib/filler/parser";

describe("Parser", () => {
  test("Parse template file (single line)", () => {
    const file =
      "<!--\
    @template main\
    @a 1234 \
    @b abcdef\
    @c 12-12-2019 \
    -->";
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
});
