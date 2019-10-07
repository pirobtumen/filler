import { IBuilder, IFile, IStore } from "../interfaces";
import { cssBuilder, htmlBuilder } from "./builders";

export class Builder {
  private builders: { [key: string]: IBuilder } = {
    html: htmlBuilder,
    css: cssBuilder
  };
  constructor(private store: IStore) {}

  public async buildFile(file: IFile) {
    const builder = this.builders[file.extension];
    if (builder) return builder(this.store, file);
    else return file;
  }
}
