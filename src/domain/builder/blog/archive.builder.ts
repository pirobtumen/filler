import { IFile, IPostMetadata, IBuilderCache } from "../../../interfaces";
import { postSorter } from "./post.sorter";
import { fillPostMetadata } from "./post.filler";
import { getPostMetadata } from "../parser";
import { ICache } from "../../../lib/cache";

export const archiveBuilder = (cache: ICache<IBuilderCache>) => {
  const config = cache.get("config");
  const posts = cache.get("posts");
  const { archivePost } = cache.get("templates");

  if (!archivePost) {
    throw new Error("There is no template for archive.");
  }

  const archivePostTemplate = archivePost.raw.toString();

  return posts
    .map((post: IFile) => getPostMetadata(config, post))
    .sort(postSorter)
    .map((pm: IPostMetadata) => fillPostMetadata(archivePostTemplate, pm))
    .join("");
};
