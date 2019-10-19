import { Store } from "../../src/lib/store";
import { IFile } from "../../src/lib/interfaces";
import { htmlBuilder } from "../../src/lib/builder/builders";
import { DirScanner } from "../../src/lib/dir-scanner";

describe("Builder - HTML", () => {
  test("Builds file without template", async () => {
    const store = new Store();
    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n  \n--> <p>test</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: " <p>test</p>"
    };

    const output = await htmlBuilder(store, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Template not found", async () => {
    const store = new Store();
    store.set("templates", {});
    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <p>test</p>"
    };

    return expect(htmlBuilder(store, fakeFile)).rejects.toEqual(
      new Error("Template main not found.")
    );
  });

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
      raw: "<!--\n @template main \n--> <p>test</p>"
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
      raw: "<!--\n @template main \n--> <p>{{var:myvar2}}</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: "<div>ABCD <p>XYZA</p></div>"
    };

    const output = await htmlBuilder(store, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Replace vars configMode", async () => {
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
      raw: "<!--\n @template main \n--> <p>{{var:myvar2}}</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: "<div>ABCD <p></p>always</div>"
    };

    const output = await htmlBuilder(store, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("No recent post template file", async () => {
    const store = new Store();
    store.set("config", { recentPosts: 2 });
    store.set("templates", {
      main: "<div>{{content}}</div>"
    });
    store.set("posts", DirScanner.scanAndGetFiles("./test/data/project/posts"));

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <div>{{blog:recent-posts}}</div>"
    };

    expect(htmlBuilder(store, fakeFile)).rejects.toThrowError();
  });

  test("Recent posts", async () => {
    const store = new Store();
    store.set("config", { recentPosts: 2 });
    store.set("templates", {
      main: "<div>{{content}}</div>",
      recentPost:
        "<div>{{title}}</div><p>{{author}}</p><p>{{description}}</p><p>{{date}}</p>"
    });
    store.set(
      "posts",
      await DirScanner.scanAndGetFiles("./test/data/project/posts")
    );

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <div>{{blog:recent-posts}}</div>"
    };

    const result: IFile = {
      ...fakeFile,
      raw:
        "<div> <div><div>Fourth post</div><p>Test</p><p>Fourth blog test</p><p>04-01-2019</p><div>Third post</div><p>Test</p><p>Third blog test</p><p>03-01-2019</p></div></div>"
    };

    const output = await htmlBuilder(store, fakeFile);
    expect(output).toMatchObject(result);
  });
});
