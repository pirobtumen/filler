import { ICache, IFile, IPostMetadata } from "../../../interfaces";
import { postSorter } from "./post.sorter";
import { fillPostMetadata } from "./post.filler";
import { getPostMetadata } from "../parser";

export const archiveBuilder = (cache: ICache) => {
  const config = cache.get("config");
  const posts = cache.get("posts");
  const { archivePost: archiveTemplate } = cache.get("templates");

  if (!archiveTemplate) {
    throw new Error("There is no template for archive.");
  }

  return posts
    .map((post: IFile) => getPostMetadata(config, post))
    .sort(postSorter)
    .map((pm: IPostMetadata) => fillPostMetadata(archiveTemplate, pm))
    .join("");
};
