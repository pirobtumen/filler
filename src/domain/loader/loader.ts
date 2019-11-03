import { join } from "path";

import { IFile, IBuilderCache, ISnippet } from "../../interfaces";
import { DirScanner } from "../../lib/dir-scanner";
import { readFile } from "../../lib/io";
import { ICache } from "../../lib/cache";

export class Loader {
  private cache: ICache<IBuilderCache>;

  constructor(cache: ICache<IBuilderCache>) {
    this.cache = cache;
  }

  public async init() {
    const [templates, snippets, posts] = await Promise.all([
      this.loadTemplates(),
      this.loadSnippets(),
      this.loadPosts()
    ]);

    this.cache.set("templates", templates);
    this.cache.set("snippets", snippets);
    this.cache.set("posts", posts);
  }

  private async loadTemplates() {
    const config = this.cache.get("config");
    const templates: { [key: string]: IFile } = {};
    const templateFolder = join(config.projectFolder, config.templateFolder);
    try {
      const files = await DirScanner.scanAndGetFiles(templateFolder);

      for (const file of files) {
        templates[file.name] = file;
      }

      return templates;
    } catch (error) {
      return {};
    }
  }

  private async loadSnippets() {
    const config = this.cache.get("config");
    const snippets: {
      [key: string]: ISnippet;
    } = {};
    const snippetsFolder = join(config.projectFolder, config.snippetsFolder);
    try {
      snippets["analytics"] = {
        configMode: "prod",
        value: (await readFile(
          join(snippetsFolder, "analytics.html")
        )).toString()
      };
      snippets["scripts"] = {
        configMode: "all",
        value: (await readFile(join(snippetsFolder, "scripts.html"))).toString()
      };
    } catch (error) {}

    return snippets;
  }

  private async loadPosts() {
    const config = this.cache.get("config");
    const postsFolder = join(config.projectFolder, config.postsFolder);
    try {
      return await DirScanner.scanAndGetFiles(postsFolder);
    } catch (error) {
      return [];
    }
  }
}
