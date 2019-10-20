import { parse } from "marked";

import { IBuilder, IFile, IStore } from "../../../interfaces";
import { htmlBuilder } from "./html.builder";

const parseMarkdown = async (markdown: string) => {
  return new Promise<string>((resolve, rejects) => {
    parse(markdown, (error, result) => {
      if (error) return rejects(error);
      resolve(result);
    });
  });
};

export const markdownBuilder: IBuilder = async (store: IStore, file: IFile) => {
  const newFile = { ...file, raw: await parseMarkdown(file.raw.toString()) };
  return htmlBuilder(store, newFile);
};
