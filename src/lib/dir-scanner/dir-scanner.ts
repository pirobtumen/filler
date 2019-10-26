import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

import { IFile } from "../../interfaces";
import { exists } from "../io";

export class DirScanner {
  private files: IFile[] = [];

  constructor(private rootFolder: string) {}

  public static async scanAndGetFiles(folder: string) {
    if (!(await exists(folder))) {
      throw new Error(`DirScanner: folder ${folder} does not exist`);
    }

    const dir = new this(folder);
    await dir.scanFolder();
    return dir.getFiles();
  }

  public getFiles() {
    return this.files;
  }

  public async scanFolder() {
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
        let extension: string, filename: string;
        const filePath = join(folder, f.name);
        const inPath = join(this.rootFolder, filePath);
        const raw = readFileSync(inPath);
        const metadata = statSync(inPath);
        const filenameSplit = f.name.split(".");
        if (filenameSplit.length > 1) {
          extension = filenameSplit.pop()!;
          filename = filenameSplit.join(".");
        } else {
          extension = "";
          filename = filenameSplit[0];
        }

        const file: IFile = {
          name: filename,
          extension: extension,
          path: folder,
          modifiedAt: metadata.mtime,
          raw
        };

        this.files.push(file);
      }
    }
  }
}
