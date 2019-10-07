import { processString as uglifyCssString } from "uglifycss";

import { IBuilder, IFile, IStore } from "../../interfaces";

export const cssBuilder: IBuilder = async (store: IStore, file: IFile) => {
  const newFile = { ...file };
  newFile.raw = uglifyCssString(file.raw.toString());
  return newFile;
};
