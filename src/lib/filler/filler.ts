import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

import { DirScanner } from "../dir-scanner";
import { mkdir, unlink } from "../io";
import { IFile, IStore } from "../interfaces";
import { Builder } from "../builder";

export class Filler {
  private store: IStore;
  private builder: Builder;

  constructor(store: IStore, builder: Builder) {
    this.store = store;
    this.builder = builder;
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

  public async build() {
    const config = this.store.get("config");
    const publicFolder = join(config.projectFolder, config.publicFolder);
    let filesUpdated = 0;

    const posts = this.store.get("posts").map((p: IFile) => ({
      ...p,
      path: config.postsFolder
    }));

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
