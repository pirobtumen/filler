import { parse } from "marked";

import { IBuilder, IFile, IBuilderCache } from "../../../interfaces";
import { buildHtml } from "./html.builder";
import { ICache } from "../../../lib/cache";

const parseMarkdown = async (markdown: string) => {
  return new Promise<string>((resolve, rejects) => {
    parse(markdown, (error, result) => {
      if (error) return rejects(error);
      resolve(result);
    });
  });
};

export const markdownBuilder: IBuilder = async (
  cache: ICache<IBuilderCache>,
  file: IFile
) => {
  const newFile: IFile = {
    ...file,
    extension: "html",
    raw: await parseMarkdown(file.raw.toString())
  };

  return buildHtml(cache, newFile);
};
