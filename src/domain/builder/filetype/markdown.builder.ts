import { parse } from "marked";

import { IBuilder, IFile, ICache } from "../../../interfaces";
import { buildHtml } from "./html.builder";

const parseMarkdown = async (markdown: string) => {
  return new Promise<string>((resolve, rejects) => {
    parse(markdown, (error, result) => {
      if (error) return rejects(error);
      resolve(result);
    });
  });
};

export const markdownBuilder: IBuilder = async (cache: ICache, file: IFile) => {
  const newFile: IFile = {
    ...file,
    extension: "html",
    raw: await parseMarkdown(file.raw.toString())
  };

  return buildHtml(cache, newFile);
};
