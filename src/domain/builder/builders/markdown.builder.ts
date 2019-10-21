import { parse } from "marked";

import { IBuilder, IFile, ICache } from "../../../interfaces";
import { htmlBuilder } from "./html.builder";

const parseMarkdown = async (markdown: string) => {
  return new Promise<string>((resolve, rejects) => {
    parse(markdown, (error, result) => {
      if (error) return rejects(error);
      resolve(result);
    });
  });
};

export const markdownBuilder: IBuilder = async (cache: ICache, file: IFile) => {
  const nameParts = file.name.split(".");
  nameParts[nameParts.length - 1] = "html";

  const newFile: IFile = {
    ...file,
    name: nameParts.join("."),
    extension: "html",
    raw: await parseMarkdown(file.raw.toString())
  };

  return htmlBuilder(cache, newFile);
};
