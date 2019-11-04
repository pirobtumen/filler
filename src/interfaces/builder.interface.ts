import { IFile } from ".";
import { ICache } from "../lib/cache";
import { IConfig } from "./config.interface";

export interface IBuilder {
  (cache: ICache<IBuilderCache>, file: IFile): Promise<IFile>;
}

export interface IFileMetadata {
  template?: string;
  [key: string]: string | undefined;
}

export interface IBuildFile {
  file: IFile;
  metadata: IFileMetadata;
  parsed: string;
}

export interface IPostMetadata {
  title: string;
  description: string;
  author: string;
  date: string;
  createdAt: Date;
  href: string;
}

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
