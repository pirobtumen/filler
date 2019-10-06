export interface IFile {
  name: string;
  extension: string;
  path: string;
  modifiedAt: Date;
  raw: Buffer | string;
}
