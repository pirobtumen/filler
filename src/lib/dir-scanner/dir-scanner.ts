import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

import { IFile } from ".";
import { exists } from "../command";

export class DirScanner {
  private rootFolder: string = "";
  private files: IFile[] = [];

  public static async scan(folder: string) {
    if (!(await exists(folder))) {
      throw new Error(`DirScanner: folder ${folder} does not exist`);
    }

    const dir = new this();
    dir.rootFolder = folder;
    await dir.exploreFolder();
    return dir;
  }

  public getFiles() {
    return this.files;
  }

  private async exploreFolder() {
    let foldersPath = [""];

    while (foldersPath.length > 0) {
      const folder = foldersPath[0];

      foldersPath.splice(0, 1);

      const folderLs = readdirSync(join(this.rootFolder, folder), {
        withFileTypes: true
      });

      const folderFiles = folderLs.filter(f => f.isFile());

      foldersPath = foldersPath.concat(
        folderLs
          .filter(nextFolder => nextFolder.isDirectory())
          .map(nextFolder => join(folder, nextFolder.name))
      );

      for (const f of folderFiles) {
        const filePath = join(folder, f.name);
        const inPath = join(this.rootFolder, filePath);
        const raw = readFileSync(inPath);
        const metadata = statSync(inPath);
        const file: IFile = {
          name: f.name,
          extension: f.name.split(".")[1],
          path: folder,
          modifiedAt: metadata.mtime,
          raw
        };

        this.files.push(file);
      }
    }
  }
}
