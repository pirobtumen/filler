import { join } from "path";

import { ICache, IFile } from "../../interfaces";
import { DirScanner } from "../../lib/dir-scanner";
import { mkdir, unlink } from "../../lib/io";
import { writeFileSync } from "fs";

export class Storer {
  private cache: ICache;

  constructor(cache: ICache) {
    this.cache = cache;
  }

  private async saveFile(file: IFile) {
    const config = this.cache.get("config");
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

  public async save(files: Array<IFile>) {
    const config = this.cache.get("config");
    let filesUpdated = 0;

    await mkdir(config.distFolder, { recursive: true });
    const distFiles = await DirScanner.scanAndGetFiles(config.distFolder);

    for (const f of files) {
      const distFileIndex = distFiles.findIndex(
        df => df.name === f.name && df.path === f.path
      );

      if (
        distFileIndex === -1 ||
        f.modifiedAt > distFiles[distFileIndex].modifiedAt ||
        config.force
      ) {
        this.saveFile(f);
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
      console.log("WARNING: There are no changes.");
    }
  }
}
