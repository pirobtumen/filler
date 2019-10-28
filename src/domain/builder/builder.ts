import { IBuilder, IFile, ICache } from "../../interfaces";
import { buildCss, buildHtml, markdownBuilder } from "./filetype";
import { join } from "path";
import { DirScanner } from "../../lib/dir-scanner";
import { getPostMetadata } from "./parser";
import { fillPostMetadata } from "./blog";

export interface IBuilders {
  [key: string]: IBuilder;
}

export const defaultBuilders = {
  html: buildHtml,
  css: buildCss,
  md: markdownBuilder
};

export class Builder {
  private cache: ICache;
  private builders: IBuilders;

  constructor(cache: ICache, builders: IBuilders) {
    this.cache = cache;
    this.builders = builders;
  }

  public async buildTemplates() {
    const templates = this.cache.get("templates");
    const buildTemplates: { [key: string]: IFile } = {};

    for (const key of Object.keys(templates)) {
      buildTemplates[key] = await buildHtml(this.cache, templates[key]);
    }

    this.cache.set("templates", buildTemplates);
  }

  public async buildFile(file: IFile) {
    const builder = this.builders[file.extension];
    if (builder) return builder(this.cache, file);
    else return file;
  }

  public async build() {
    await this.buildTemplates();
    const config = this.cache.get("config");
    const publicFolder = join(config.projectFolder, config.publicFolder);
    const posts = this.cache.get("posts").map(
      (p: IFile): IFile => ({
        ...p,
        path: config.postsFolder
      })
    );

    const publicFiles = await Promise.all(
      [...(await DirScanner.scanAndGetFiles(publicFolder)), ...posts].map(pf =>
        this.buildFile(pf)
      )
    );

    return publicFiles;
  }
}
