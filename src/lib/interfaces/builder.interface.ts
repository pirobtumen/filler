import { IFile } from ".";

export interface IStore {
  set: (key: string, value: any) => void;
  get: (key: string) => any;
}

export interface IBuilder {
  (store: IStore, file: IFile): Promise<IFile>;
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

export interface IConfig {
  force: boolean;
  templateFolder: string;
  distFolder: string;
  publicFolder: string;
  varsFolder: string;
  projectFolder: string;
  postsFolder: string;
  mode: string;
  recentPosts: number;
}

export interface IPostMetadata {
  title: string;
  description: string;
  author: string;
  createdAt: Date;
}
