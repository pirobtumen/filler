import { IFile, ICache } from ".";

export interface IBuilder {
  (cache: ICache, file: IFile): Promise<IFile>;
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
