import { IBuilder, IFile, ICache, IPostMetadata } from "../../../interfaces";
import { getFileMetadata } from "../../builder";
import { join } from "path";

export const htmlBuilder: IBuilder = async (cache: ICache, file: IFile) => {
  const config = cache.get("config");
  const templates = cache.get("templates");
  const snippets = cache.get("snippets");

  const newFile = { ...file };
  const { metadata, html: content } = getFileMetadata(newFile);
  let output = "";

  if (metadata.template) {
    if (!templates[metadata.template]) {
      throw new Error(`Template ${metadata.template} not found.`);
    }

    output = templates[metadata.template];
    output = output.replace("{{content}}", content);
  } else {
    output = content;
  }

  const recentPosts = output.match(/{{blog:recent-posts}}/g);
  if (recentPosts) {
    output = output.replace("{{blog:recent-posts}}", buildRecentPosts(cache));
  }

  const archive = output.match(/{{blog:archive}}/g);
  if (archive) {
    output = output.replace("{{blog:archive}}", buildArchive(cache));
  }

  const templateSnippets = output.match(/{{snippet:([a-z0-9-]*)}}/g);
  if (templateSnippets) {
    templateSnippets
      .map(v => v.slice(10, -2))
      .forEach((n, i) => {
        const snippetValue =
          config.mode === snippets[n].configMode ||
          snippets[n].configMode === "all"
            ? snippets[n].value
            : "";

        output = output.replace(templateSnippets[i], snippetValue);
      });
  }

  newFile.raw = output;
  return newFile;
};

const getPostMetadata = (post: IFile) => {
  const { metadata } = getFileMetadata(post);
  // TODO validation
  const [day, month, year] = metadata.date!.split("-").map(d => parseInt(d));

  const postMedata: IPostMetadata = {
    title: metadata.title!,
    description: metadata.description!,
    author: metadata.author!,
    date: metadata.date!,
    createdAt: new Date(year, month - 1, day, 0, 0, 0, 0),
    href: join(post.path, post.name)
  };

  return postMedata;
};

const fillPostMetadata = (template: string, postMetadata: IPostMetadata) => {
  return template
    .replace("{{title}}", postMetadata.title)
    .replace("{{author}}", postMetadata.author)
    .replace("{{date}}", postMetadata.date)
    .replace("{{description}}", postMetadata.description)
    .replace("{{href}}", postMetadata.href);
};

const sortPosts = (p1: IPostMetadata, p2: IPostMetadata) => {
  const d1 = p1.createdAt;
  const d2 = p2.createdAt;

  if (d1 > d2) return -1;
  else if (d1 === d2) return 0;
  else return 1;
};

const buildRecentPosts = (cache: ICache) => {
  const config = cache.get("config");
  const posts = cache.get("posts");
  const { recentPost: recentPostTemplate } = cache.get("templates");

  if (!recentPostTemplate) {
    throw new Error("There is no template for recent posts.");
  }

  return posts
    .map((post: IFile) => getPostMetadata(post))
    .sort(sortPosts)
    .slice(0, config.recentPosts)
    .map((pm: IPostMetadata) => fillPostMetadata(recentPostTemplate, pm))
    .join("");
};

const buildArchive = (cache: ICache) => {
  const posts = cache.get("posts");
  const { archivePost: archiveTemplate } = cache.get("templates");

  if (!archiveTemplate) {
    throw new Error("There is no template for archive.");
  }

  return posts
    .map((post: IFile) => getPostMetadata(post))
    .sort(sortPosts)
    .map((pm: IPostMetadata) => fillPostMetadata(archiveTemplate, pm))
    .join("");
};
