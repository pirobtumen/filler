import { Builder, IBuilders } from "../../src/domain/builder";
import { MemoryCache } from "../../src/lib/cache";
import { IFile } from "../../src/interfaces";

describe("Builder", () => {
  test("Build file calls registered builder", async () => {
    const cache = new MemoryCache();
    const fakeFile: IFile = {
      name: "test",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "fake-file"
    };
    const fakeBuilder = jest.fn(async (cache, file) => {
      return file;
    });
    const builders: IBuilders = {
      html: fakeBuilder
    };

    const builder = new Builder(cache, builders);
    const output = await builder.buildFile(fakeFile);

    expect(output).toMatchObject(fakeFile);
    expect(fakeBuilder).toHaveBeenCalledWith(cache, fakeFile);
  });

  test("Build file calls unregistered builder", async () => {
    const cache = new MemoryCache();
    const fakeFile: IFile = {
      name: "test",
      extension: "css",
      modifiedAt: new Date(),
      path: "",
      raw: "fake-file"
    };
    const fakeBuilder = jest.fn(async (cache, file) => {
      return file;
    });
    const builders: IBuilders = {
      html: fakeBuilder
    };

    const builder = new Builder(cache, builders);
    const output = await builder.buildFile(fakeFile);

    expect(output).toMatchObject(fakeFile);
    expect(fakeBuilder).not.toHaveBeenCalled();
  });
});
