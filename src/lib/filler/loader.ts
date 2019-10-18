import { join } from "path";

import { IStore } from "../interfaces";
import { DirScanner } from "../dir-scanner";
import { readFile } from "../io";

interface IVar {
  configMode: "prod" | "dev" | "all";
  value: string;
}

export class Loader {
  private store: IStore;

  constructor(store: IStore) {
    this.store = store;
  }

  public async init() {
    const [templates, vars, posts] = await Promise.all([
      this.loadTemplates(),
      this.loadVars(),
      this.loadPosts()
    ]);

    this.store.set("templates", templates);
    this.store.set("vars", vars);
    this.store.set("posts", posts);
  }

  private async loadTemplates() {
    const config = this.store.get("config");
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

  private async loadVars() {
    const config = this.store.get("config");
    const vars: {
      [key: string]: IVar;
    } = {};
    const varsFolder = join(config.projectFolder, config.varsFolder);
    try {
      vars["analytics"] = {
        configMode: "prod",
        value: (await readFile(join(varsFolder, "analytics.html"))).toString()
      };
      vars["scripts"] = {
        configMode: "all",
        value: (await readFile(join(varsFolder, "scripts.html"))).toString()
      };
    } catch (error) {}

    return vars;
  }

  private async loadPosts() {
    const config = this.store.get("config");
    const postsFolder = join(config.projectFolder, config.postsFolder);
    try {
      return await DirScanner.scanAndGetFiles(postsFolder);
    } catch (error) {
      return [];
    }
  }
}
