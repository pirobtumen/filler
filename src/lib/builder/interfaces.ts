import { IFile } from "../dir-scanner";

export interface IFileMetadata {
  template?: string;
  [key: string]: string | undefined;
}

export interface IBuildFile {
  file: IFile;
  metadata: IFileMetadata;
  parsed: string;
}
