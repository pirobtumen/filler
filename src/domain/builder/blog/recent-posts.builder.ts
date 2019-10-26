import { IFile, ICache, IPostMetadata } from "../../../interfaces";
import { getPostMetadata } from "../parser";
import { postSorter } from "./post.sorter";
import { fillPostMetadata } from "./post.filler";

export const recentPostsBuilder = (cache: ICache) => {
  const config = cache.get("config");
  const posts = cache.get("posts");
  const { recentPost: recentPostTemplate } = cache.get("templates");

  if (!recentPostTemplate) {
    throw new Error("There is no template for recent posts.");
  }

  return posts
    .map((post: IFile) => getPostMetadata(config, post))
    .sort(postSorter)
    .slice(0, config.recentPosts)
    .map((pm: IPostMetadata) => fillPostMetadata(recentPostTemplate, pm))
    .join("");
};
