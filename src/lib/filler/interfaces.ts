import { IFile } from "../dir-scanner";

export interface IConfig {
  force: boolean;
  templateFolder: string;
  distFolder: string;
  publicFolder: string;
  varsFolder: string;
  projectFolder: string;
  postsFolder: string;
  mode: string;
}
export interface IFillerMetadata {
  template?: string;
  [key: string]: string | undefined;
}

export interface IFillerFile {
  file: IFile;
  metadata?: IFillerMetadata;
  parsed?: string;
}

export interface IPostMetadata {
  title: string;
  description: string;
  author: string;
  createdAt: Date;
}
