import { join } from "path";
import { writeFileSync } from "fs";

import { IFile, IBuilderCache } from "../../interfaces";
import { DirScanner } from "../../lib/dir-scanner";
import { mkdir, unlink } from "../../lib/io";
import { ICache } from "../../lib/cache";
import { getHash } from "../../lib/hash";

export class Storer {
  private cache: ICache<IBuilderCache>;

  constructor(cache: ICache<IBuilderCache>) {
    this.cache = cache;
  }

  private fileHasChanges(a: IFile, b: IFile) {
    const aHash = getHash(a.raw.toString());
    const bHash = getHash(b.raw.toString());

    return aHash !== bHash;
  }

  public async saveFile(file: IFile) {
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

    const outFilePath = `${join(outFolder, file.name)}.${file.extension}`;
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
        this.fileHasChanges(f, distFiles[distFileIndex]) ||
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
      const filePath = join(
        config.distFolder,
        f.path,
        `${f.name}.${f.extension}`
      );
      await unlink(filePath);
      console.log(`- ${filePath}`);
      filesUpdated += 1;
    }

    if (filesUpdated === 0) {
      console.log("There are no changes.");
    }
  }
}
