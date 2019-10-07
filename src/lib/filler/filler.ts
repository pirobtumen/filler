import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

import { DirScanner } from "../dir-scanner";
import { mkdir, unlink } from "../io";
import { IPostMetadata, IFile } from "../interfaces";
import { Builder, getFileMetadata } from "../builder";
import { Store } from "../store";

export class Filler {
  private store: Store;
  private builder: Builder;

  constructor(store: Store) {
    this.store = store;
    this.builder = new Builder(store);
  }

  public async init() {
    const templates = await this.loadTemplates();
    const vars = this.loadVars();
    this.store.set("templates", templates);
    this.store.set("vars", vars);
  }

  private async loadTemplates() {
    const config = this.store.get("config");
    const templates: { [key: string]: string } = {};
    const templateFolder = join(config.projectFolder, config.templateFolder);
    const files = await DirScanner.scanAndGetFiles(templateFolder);

    for (const file of files) {
      const name = file.name.split(".")[0];
      templates[name] = file.raw.toString();
    }

    return templates;
  }

  private loadVars() {
    const config = this.store.get("config");
    const vars: {
      [key: string]: { configMode: "prod" | "dev" | "all"; value: string };
    } = {};
    const varsFolder = join(config.projectFolder, config.varsFolder);
    vars["analytics"] = {
      configMode: "prod",
      value: readFileSync(join(varsFolder, "analytics.html")).toString()
    };
    vars["scripts"] = {
      configMode: "all",
      value: readFileSync(join(varsFolder, "scripts.html")).toString()
    };

    return vars;
  }

  private async saveFile(file: IFile) {
    const config = this.store.get("config");
    const outFolder = join(config.distFolder, file.path);
    try {
      await mkdir(outFolder, { recursive: true });
    } catch (e) {
      console.log(e);
    }

    const content = file.raw;
    if (!content) {
      // TODO Show warnings at the end of the file
      console.log(`WARNING: Empty file ${file.path} `);
    }

    const outFilePath = join(outFolder, file.name);
    console.log(`+ ${outFilePath}`);
    writeFileSync(outFilePath, content);
  }

  private generateRecentPosts(posts: Array<IFile>) {
    const postsMetdata: Array<IPostMetadata> = [];
    const config = this.store.get("config");

    for (const post of posts) {
      const { metadata } = getFileMetadata(post.raw.toString());
      // TODO validation
      const [day, month, year] = metadata
        .date!.split("-")
        .map(d => parseInt(d));

      const postMetadata: IPostMetadata = {
        title: metadata.title!,
        description: metadata.description!,
        author: metadata.author!,
        createdAt: new Date(year, month - 1, day, 0, 0, 0, 0)
      };

      postsMetdata.push(postMetadata);
    }

    const recentPosts = postsMetdata
      .sort((p1, p2) => {
        const d1 = p1.createdAt;
        const d2 = p2.createdAt;

        if (d1 > d2) return -1;
        else if (d1 === d2) return 0;
        else return 1;
      })
      .slice(0, config.recentPosts);
    this.store.set("recentPosts", recentPosts);
  }

  public async build() {
    const config = this.store.get("config");
    const postsFolder = join(config.projectFolder, config.postsFolder);
    const publicFolder = join(config.projectFolder, config.publicFolder);
    let filesUpdated = 0;

    const posts = (await DirScanner.scanAndGetFiles(postsFolder)).map(p => ({
      ...p,
      path: config.postsFolder
    }));

    this.generateRecentPosts(posts);

    await mkdir(config.distFolder, { recursive: true });
    const distFiles = await DirScanner.scanAndGetFiles(config.distFolder);
    const publicFiles = [
      ...(await DirScanner.scanAndGetFiles(publicFolder)),
      ...posts
    ];

    for (const pf of publicFiles) {
      const distFileIndex = distFiles.findIndex(
        df => df.name === pf.name && df.path === pf.path
      );

      if (
        distFileIndex === -1 ||
        pf.modifiedAt > distFiles[distFileIndex].modifiedAt ||
        config.force
      ) {
        const file = await this.builder.buildFile(pf);
        this.saveFile(file);
        filesUpdated += 1;
      }

      if (distFileIndex > -1) {
        distFiles.splice(distFileIndex, 1);
      }
    }

    for (const f of distFiles) {
      const filePath = join(config.distFolder, f.path, f.name);
      await unlink(filePath);
      console.log(`- ${filePath}`);
      filesUpdated += 1;
    }

    if (filesUpdated === 0) {
      console.log("WARNING: Any file was updated.");
    }
  }
}
