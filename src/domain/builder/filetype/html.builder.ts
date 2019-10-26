import { IBuilder, IFile, ICache } from "../../../interfaces";
import { getFileMetadata } from "../parser";
import { recentPostsBuilder, archiveBuilder } from "../blog";

export const buildHtml: IBuilder = async (cache: ICache, file: IFile) => {
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
    output = output.replace("{{blog:recent-posts}}", recentPostsBuilder(cache));
  }

  const archive = output.match(/{{blog:archive}}/g);
  if (archive) {
    output = output.replace("{{blog:archive}}", archiveBuilder(cache));
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