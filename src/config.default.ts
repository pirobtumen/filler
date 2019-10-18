import { IConfig } from "./lib/interfaces";

export const defaultConfig: IConfig = {
  templateFolder: "templates",
  postsFolder: "posts",
  publicFolder: "public",
  distFolder: "./dist",
  varsFolder: "vars",
  projectFolder: "",
  force: false,
  mode: "dev",
  recentPosts: 5
};
