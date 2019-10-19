import { Store } from "../../src/lib/store";
import { IFile } from "../../src/lib/interfaces";
import { htmlBuilder } from "../../src/lib/builder/builders";

describe("Builder - HTML", () => {
  test("Replace content correctly", async () => {
    const store = new Store();
    store.set("templates", {
      main: "<div>{{content}}</div>"
    });

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!-- @template main --> <p>test</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: "<div> <p>test</p></div>"
    };

    const output = await htmlBuilder(store, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Replace vars inside template correctly", async () => {
    const store = new Store();
    store.set("config", { mode: "prod" });
    store.set("templates", {
      main: "<div>{{var:myvar1}}{{content}}</div>"
    });
    store.set("vars", {
      myvar1: { configMode: "all", value: "ABCD" },
      myvar2: { configMode: "all", value: "XYZA" }
    });

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!-- @template main --> <p>{{var:myvar2}}</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: "<div>ABCD <p>XYZA</p></div>"
    };

    const output = await htmlBuilder(store, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Replace vars when ", async () => {
    const store = new Store();
    store.set("config", { mode: "prod" });
    store.set("templates", {
      main: "<div>{{var:myvar1}}{{content}}{{var:myvar3}}</div>"
    });
    store.set("vars", {
      myvar1: { configMode: "prod", value: "ABCD" },
      myvar2: { configMode: "dev", value: "XYZA" },
      myvar3: { configMode: "all", value: "always" }
    });

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!-- @template main --> <p>{{var:myvar2}}</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: "<div>ABCD <p></p>always</div>"
    };

    const output = await htmlBuilder(store, fakeFile);
    expect(output).toMatchObject(result);
  });
});
