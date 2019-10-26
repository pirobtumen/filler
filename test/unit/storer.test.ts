import { MemoryCache } from "../../src/lib/cache";
import { Storer } from "../../src/domain/storer";
import { writeFileSync } from "fs";
import { IFile } from "../../src/interfaces";
import { mkdir } from "../../src/lib/io";
import { DirScanner } from "../../src/lib/dir-scanner";

jest.mock("fs");
jest.mock("../../src/lib/io");
DirScanner.scanAndGetFiles = jest.fn(async () => []);

describe("Storer", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Save single file", async () => {
    const cache = new MemoryCache();
    cache.set("config", {
      distFolder: "dist"
    });

    const fakeFile: IFile = {
      name: "test",
      extension: "html",
      modifiedAt: new Date(),
      path: "/some/path",
      raw: "fake-file"
    };

    const storer = new Storer(cache);
    await storer.saveFile(fakeFile);
    expect(mkdir).toHaveBeenCalledWith("dist/some/path", { recursive: true });
    expect(writeFileSync).toHaveBeenCalledWith(
      "dist/some/path/test.html",
      "fake-file"
    );
  });

  test("Save multiple files", async () => {
    const cache = new MemoryCache();
    cache.set("config", {
      distFolder: "dist"
    });

    const fakeFile: IFile = {
      name: "test",
      extension: "html",
      modifiedAt: new Date(),
      path: "/some/path",
      raw: "fake-file"
    };

    const files = [fakeFile];

    const storer = new Storer(cache);
    const spy = jest.spyOn(storer, "saveFile");
    await storer.save(files);
    expect(mkdir).toHaveBeenCalledWith("dist", { recursive: true });
    expect(DirScanner.scanAndGetFiles).toHaveBeenCalledWith("dist");
    expect(spy).toHaveBeenCalled();
  });
});
