import { join } from "path";

import { ICache } from "../../interfaces";
import { DirScanner } from "../../lib/dir-scanner";
import { readFile } from "../../lib/io";

interface IVar {
  configMode: "prod" | "dev" | "all";
  value: string;
}

export class Loader {
  private cache: ICache;

  constructor(cache: ICache) {
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
    const templates: { [key: string]: string } = {};
    const templateFolder = join(config.projectFolder, config.templateFolder);
    try {
      const files = await DirScanner.scanAndGetFiles(templateFolder);

      for (const file of files) {
        const name = file.name.split(".")[0];
        templates[name] = file.raw.toString();
      }

      return templates;
    } catch (error) {
      return {};
    }
  }

  private async loadSnippets() {
    const config = this.cache.get("config");
    const snippets: {
      [key: string]: IVar;
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
