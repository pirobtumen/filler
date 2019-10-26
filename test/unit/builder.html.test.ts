import { MemoryCache } from "../../src/lib/cache";
import { IFile } from "../../src/interfaces";
import { htmlBuilder } from "../../src/domain/builder/builders";
import { DirScanner } from "../../src/lib/dir-scanner";

describe("Builder - HTML", () => {
  test("Builds file without template", async () => {
    const cache = new MemoryCache();
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

    const output = await htmlBuilder(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Template not found", async () => {
    const cache = new MemoryCache();
    cache.set("templates", {});
    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <p>test</p>"
    };

    return expect(htmlBuilder(cache, fakeFile)).rejects.toEqual(
      new Error("Template main not found.")
    );
  });

  test("Replace content correctly", async () => {
    const cache = new MemoryCache();
    cache.set("templates", {
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

    const output = await htmlBuilder(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Replace snippets inside template correctly", async () => {
    const cache = new MemoryCache();
    cache.set("config", { mode: "prod" });
    cache.set("templates", {
      main: "<div>{{snippet:myvar1}}{{content}}</div>"
    });
    cache.set("snippets", {
      myvar1: { configMode: "all", value: "ABCD" },
      myvar2: { configMode: "all", value: "XYZA" }
    });

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <p>{{snippet:myvar2}}</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: "<div>ABCD <p>XYZA</p></div>"
    };

    const output = await htmlBuilder(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Replace snippets configMode", async () => {
    const cache = new MemoryCache();
    cache.set("config", { mode: "prod" });
    cache.set("templates", {
      main: "<div>{{snippet:myvar1}}{{content}}{{snippet:myvar3}}</div>"
    });
    cache.set("snippets", {
      myvar1: { configMode: "prod", value: "ABCD" },
      myvar2: { configMode: "dev", value: "XYZA" },
      myvar3: { configMode: "all", value: "always" }
    });

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <p>{{snippet:myvar2}}</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: "<div>ABCD <p></p>always</div>"
    };

    const output = await htmlBuilder(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("No recent post template file", async () => {
    const cache = new MemoryCache();
    cache.set("config", { recentPosts: 2 });
    cache.set("templates", {
      main: "<div>{{content}}</div>"
    });
    cache.set("posts", DirScanner.scanAndGetFiles("./test/data/project/posts"));

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <div>{{blog:recent-posts}}</div>"
    };

    return expect(htmlBuilder(cache, fakeFile)).rejects.toThrow(
      new Error("There is no template for recent posts.")
    );
  });

  test("Recent posts", async () => {
    const cache = new MemoryCache();
    cache.set("config", { recentPosts: 2, postsFolder: "posts" });
    cache.set("templates", {
      main: "<div>{{content}}</div>",
      recentPost:
        '<div href="{{href}}"><p>{{title}}</p><p>{{author}}</p><p>{{description}}</p><p>{{date}}</p></div>'
    });
    cache.set(
      "posts",
      (await DirScanner.scanAndGetFiles("./test/data/project/posts")).map(
        f => ({ ...f, path: "/some" })
      )
    );

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw:
        '<!--\n @template main \n--> <div class="recent-posts">{{blog:recent-posts}}</div>'
    };

    const posts = [
      '<div href="posts/some/fourth.html"><p>Fourth post</p><p>Test</p><p>Fourth blog test</p><p>04-01-2019</p></div>',
      '<div href="posts/some/third.html"><p>Third post</p><p>Test</p><p>Third blog test</p><p>03-01-2019</p></div>'
    ];

    const result: IFile = {
      ...fakeFile,
      raw: `<div> <div class="recent-posts">${posts.join("")}</div></div>`
    };

    const output = await htmlBuilder(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Recent posts - use partial metadata", async () => {
    const cache = new MemoryCache();
    cache.set("config", { recentPosts: 2, postsFolder: "posts" });
    cache.set("templates", {
      main: "<div>{{content}}</div>",
      recentPost: "<div>{{title}}</div><p>{{author}}</p>"
    });
    cache.set(
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
        "<div> <div><div>Fourth post</div><p>Test</p><div>Third post</div><p>Test</p></div></div>"
    };

    const output = await htmlBuilder(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("No archive post template file", async () => {
    const cache = new MemoryCache();
    cache.set("templates", {
      main: "<div>{{content}}</div>"
    });
    cache.set("posts", DirScanner.scanAndGetFiles("./test/data/project/posts"));

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <div>{{blog:archive}}</div>"
    };

    return expect(htmlBuilder(cache, fakeFile)).rejects.toThrow(
      new Error("There is no template for archive.")
    );
  });

  test("Archive", async () => {
    const cache = new MemoryCache();
    cache.set("config", { postsFolder: "posts" });
    cache.set("templates", {
      main: "<div>{{content}}</div>",
      archivePost: "<div>{{title}}</div><p>{{date}}</p>"
    });
    cache.set(
      "posts",
      await DirScanner.scanAndGetFiles("./test/data/project/posts")
    );

    const fakeFile: IFile = {
      name: "article.html",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <div>{{blog:archive}}</div>"
    };

    const result: IFile = {
      ...fakeFile,
      raw:
        "<div> <div><div>Fourth post</div><p>04-01-2019</p><div>Third post</div><p>03-01-2019</p><div>Second post</div><p>02-01-2019</p><div>First post</div><p>01-01-2019</p></div></div>"
    };

    const output = await htmlBuilder(cache, fakeFile);
    expect(output).toMatchObject(result);
  });
});
