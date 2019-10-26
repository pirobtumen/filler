import { processString as uglifyCssString } from "uglifycss";

import { IBuilder, IFile, ICache } from "../../../interfaces";

export const buildCss: IBuilder = async (cache: ICache, file: IFile) => {
  const newFile = { ...file };
  newFile.raw = uglifyCssString(file.raw.toString());
  return newFile;
};
