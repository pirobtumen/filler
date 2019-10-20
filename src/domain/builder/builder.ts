import { IBuilder, IFile, IStore } from "../../interfaces";
import { cssBuilder, htmlBuilder } from "./builders";

export interface IBuilders {
  [key: string]: IBuilder;
}

export const defaultBuilders = {
  html: htmlBuilder,
  css: cssBuilder
};

export class Builder {
  private store: IStore;
  private builders: IBuilders;

  constructor(store: IStore, builders: IBuilders) {
    this.store = store;
    this.builders = builders;
  }

  public async buildFile(file: IFile) {
    const builder = this.builders[file.extension];
    if (builder) return builder(this.store, file);
    else return file;
  }
}
