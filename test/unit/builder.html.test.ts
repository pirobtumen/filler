import { MemoryCache, ICache } from "../../src/lib/cache";
import { IFile, IBuilderCache } from "../../src/interfaces";
import { buildHtml } from "../../src/domain/builder";
import { DirScanner } from "../../src/lib/dir-scanner";
import { defaultConfig } from "../../src/use-cases/build/config.default";

describe("Builder - HTML", () => {
  let cache: ICache<IBuilderCache>;

  beforeEach(() => {
    const initCache: IBuilderCache = {
      config: defaultConfig,
      templates: {},
      posts: [],
      snippets: {}
    };
    cache = new MemoryCache<IBuilderCache>(initCache);
  });

  test("Builds file without template", async () => {
    const fakeFile: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n  \n--> <p>test</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: " <p>test</p>"
    };

    const output = await buildHtml(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Template not found", async () => {
    const fakeFile: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <p>test</p>"
    };

    return expect(buildHtml(cache, fakeFile)).rejects.toEqual(
      new Error("Template main not found.")
    );
  });

  test("Replace content correctly", async () => {
    cache.set("templates", {
      main: {
        name: "main",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{content}}</div>"
      }
    });

    const fakeFile: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <p>test</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: "<div> <p>test</p></div>"
    };

    const output = await buildHtml(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Replace snippets configMode", async () => {
    cache.set("config", { ...defaultConfig, mode: "prod" });
    cache.set("templates", {
      main: {
        name: "main",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{snippet:myvar1}}{{content}}{{snippet:myvar3}}</div>"
      }
    });

    cache.set("snippets", {
      myvar1: { configMode: "prod", value: "ABCD" },
      myvar2: { configMode: "dev", value: "XYZA" },
      myvar3: { configMode: "all", value: "always" }
    });

    const fakeFile: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <p>{{snippet:myvar2}}</p>"
    };

    const result: IFile = {
      ...fakeFile,
      raw: "<div>ABCD <p></p>always</div>"
    };

    const output = await buildHtml(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Post has no date", () => {
    // TOODO
  });

  test("Inject post metadata", () => {
    // TOODO
  });

  test("No recent post template file", async () => {
    cache.set("config", { ...defaultConfig, recentPosts: 2 });
    cache.set("templates", {
      main: {
        name: "main",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{content}}</div>"
      }
    });
    cache.set(
      "posts",
      await DirScanner.scanAndGetFiles("./test/data/project/posts")
    );

    const fakeFile: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <div>{{blog:recent-posts}}</div>"
    };

    return expect(buildHtml(cache, fakeFile)).rejects.toThrow(
      new Error("There is no template for recent posts.")
    );
  });

  test("Recent posts", async () => {
    cache.set("config", { ...defaultConfig, recentPosts: 2 });
    cache.set("templates", {
      main: {
        name: "main",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{content}}</div>"
      },
      recentPost: {
        name: "recentPost",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw:
          '<div href="{{href}}"><p>{{title}}</p><p>{{author}}</p><p>{{description}}</p><p>{{date}}</p></div>'
      }
    });
    cache.set(
      "posts",
      await DirScanner.scanAndGetFiles("./test/data/project/posts")
    );

    const fakeFile: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw:
        '<!--\n @template main \n--> <div class="recent-posts">{{blog:recent-posts}}</div>'
    };

    // TODO Check post in subfolder href
    const posts = [
      '<div href="posts/fourth.html"><p>Fourth post</p><p>Test</p><p>Fourth blog test</p><p>04-01-2019</p></div>',
      '<div href="posts/third.html"><p>Third post</p><p>Test</p><p>Third blog test</p><p>03-01-2019</p></div>'
    ];

    const result: IFile = {
      ...fakeFile,
      raw: `<div> <div class="recent-posts">${posts.join("")}</div></div>`
    };

    const output = await buildHtml(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("Recent posts - use partial metadata", async () => {
    cache.set("config", { ...defaultConfig, recentPosts: 2 });
    cache.set("templates", {
      main: {
        name: "main",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{content}}</div>"
      },
      recentPost: {
        name: "recentPost",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{title}}</div><p>{{author}}</p>"
      }
    });
    cache.set(
      "posts",
      await DirScanner.scanAndGetFiles("./test/data/project/posts")
    );

    const fakeFile: IFile = {
      name: "article",
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

    const output = await buildHtml(cache, fakeFile);
    expect(output).toMatchObject(result);
  });

  test("No archive post template file", async () => {
    cache.set("config", defaultConfig);
    cache.set("templates", {
      main: {
        name: "main",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{content}}</div>"
      }
    });
    cache.set(
      "posts",
      await DirScanner.scanAndGetFiles("./test/data/project/posts")
    );

    const fakeFile: IFile = {
      name: "article",
      extension: "html",
      modifiedAt: new Date(),
      path: "",
      raw: "<!--\n @template main \n--> <div>{{blog:archive}}</div>"
    };

    return expect(buildHtml(cache, fakeFile)).rejects.toThrow(
      new Error("There is no template for archive.")
    );
  });

  test("Archive", async () => {
    cache.set("config", { ...defaultConfig, recentPosts: 2 });
    cache.set("templates", {
      main: {
        name: "main",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{content}}</div>"
      },
      archivePost: {
        name: "main",
        extension: "html",
        path: "",
        modifiedAt: new Date(),
        raw: "<div>{{title}}</div><p>{{date}}</p>"
      }
    });
    cache.set(
      "posts",
      await DirScanner.scanAndGetFiles("./test/data/project/posts")
    );

    const fakeFile: IFile = {
      name: "article",
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

    const output = await buildHtml(cache, fakeFile);
    expect(output).toMatchObject(result);
  });
});
