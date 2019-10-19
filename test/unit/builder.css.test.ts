jest.mock("uglifycss");
import { processString } from "uglifycss";

import { Store } from "../../src/lib/store";
import { IFile } from "../../src/lib/interfaces";
import { cssBuilder } from "../../src/lib/builder/builders";

describe("Builder - CSS", () => {
  test("Uglify css", async () => {
    const store = new Store();
    const fakeFile: IFile = {
      name: "style.css",
      extension: "css",
      modifiedAt: new Date(),
      path: "",
      raw: "hello { fake-css: 1234; }"
    };

    const output = await cssBuilder(store, fakeFile);
    expect(processString).toHaveBeenCalled();
  });
});
