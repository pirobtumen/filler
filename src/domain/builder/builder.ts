import { IBuilder, IFile, ICache } from "../../interfaces";
import { cssBuilder, htmlBuilder, markdownBuilder } from "./builders";
import { join } from "path";
import { DirScanner } from "../../lib/dir-scanner";

export interface IBuilders {
  [key: string]: IBuilder;
}

export const defaultBuilders = {
  html: htmlBuilder,
  css: cssBuilder,
  md: markdownBuilder
};

export class Builder {
  private cache: ICache;
  private builders: IBuilders;

  constructor(cache: ICache, builders: IBuilders) {
    this.cache = cache;
    this.builders = builders;
  }

  public async buildFile(file: IFile) {
    const builder = this.builders[file.extension];
    if (builder) return builder(this.cache, file);
    else return file;
  }

  public async build() {
    const config = this.cache.get("config");
    const publicFolder = join(config.projectFolder, config.publicFolder);
    const posts = this.cache.get("posts").map((p: IFile) => ({
      ...p,
      path: config.postsFolder
    }));

    const publicFiles = await Promise.all(
      [...(await DirScanner.scanAndGetFiles(publicFolder)), ...posts].map(pf =>
        this.buildFile(pf)
      )
    );

    return publicFiles;
  }
}
