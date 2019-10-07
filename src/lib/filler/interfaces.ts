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

export interface IPostMetadata {
  title: string;
  description: string;
  author: string;
  createdAt: Date;
}
