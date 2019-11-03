import { IConfig } from "./config.interface";
import { IFile } from "./dir-scanner.interface";

export interface ISnippet {
  configMode: "prod" | "dev" | "all";
  value: string;
}

export interface IBuilderCache {
  config: IConfig;
  templates: { [key: string]: IFile };
  posts: IFile[];
  snippets: { [key: string]: ISnippet };
}
