import { IFile, IPostMetadata, IBuilderCache } from "../../../interfaces";
import { getPostMetadata } from "../parser";
import { postSorter } from "./post.sorter";
import { fillPostMetadata } from "./post.filler";
import { ICache } from "../../../lib/cache";

export const recentPostsBuilder = (cache: ICache<IBuilderCache>) => {
  const config = cache.get("config");
  const posts = cache.get("posts");
  const { recentPost } = cache.get("templates");

  if (!recentPost) {
    throw new Error("There is no template for recent posts.");
  }

  const rencentPostTemplate = recentPost.raw.toString();

  return posts
    .map((post: IFile) => getPostMetadata(config, post))
    .sort(postSorter)
    .slice(0, config.recentPosts)
    .map((pm: IPostMetadata) => fillPostMetadata(rencentPostTemplate, pm))
    .join("");
};
