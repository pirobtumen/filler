jest.mock("uglifycss");
import { processString } from "uglifycss";

import { MemoryCache } from "../../src/lib/cache";
import { IFile } from "../../src/interfaces";
import { cssBuilder } from "../../src/domain/builder/builders";

describe("Builder - CSS", () => {
  test("Uglify css", async () => {
    const cache = new MemoryCache();
    const fakeFile: IFile = {
      name: "style",
      extension: "css",
      modifiedAt: new Date(),
      path: "",
      raw: "hello { fake-css: 1234; }"
    };

    await cssBuilder(cache, fakeFile);
    expect(processString).toHaveBeenCalled();
  });
});
