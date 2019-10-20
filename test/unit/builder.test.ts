import { Builder, IBuilders } from "../../src/domain/builder";
import { Store } from "../../src/lib/store";
import { IFile } from "../../src/interfaces";

describe("Builder", () => {
  test("Build file calls registered builder", async () => {
    const store = new Store();
    const fakeFile: IFile = {
      name: "test.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "fake-file"
    };
    const fakeBuilder = jest.fn(async (store, file) => {
      return file;
    });
    const builders: IBuilders = {
      html: fakeBuilder
    };

    const builder = new Builder(store, builders);
    const output = await builder.buildFile(fakeFile);

    expect(output).toMatchObject(fakeFile);
    expect(fakeBuilder).toHaveBeenCalledWith(store, fakeFile);
  });

  test("Build file calls unregistered builder", async () => {
    const store = new Store();
    const fakeFile: IFile = {
      name: "test.css",
      extension: "css",
      modifiedAt: new Date(),
      path: "",
      raw: "fake-file"
    };
    const fakeBuilder = jest.fn(async (store, file) => {
      return file;
    });
    const builders: IBuilders = {
      html: fakeBuilder
    };

    const builder = new Builder(store, builders);
    const output = await builder.buildFile(fakeFile);

    expect(output).toMatchObject(fakeFile);
    expect(fakeBuilder).not.toHaveBeenCalled();
  });
});
