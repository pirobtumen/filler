import { IConfig } from "../../interfaces";

export const defaultConfig: IConfig = {
  templateFolder: "templates",
  postsFolder: "blog",
  inputPostsFolder: "posts",
  publicFolder: "public",
  distFolder: "dist",
  snippetsFolder: "snippets",
  projectFolder: "",
  force: false,
  mode: "dev",
  recentPosts: 5
};
