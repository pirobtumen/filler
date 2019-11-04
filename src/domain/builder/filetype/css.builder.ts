import { processString as uglifyCssString } from "uglifycss";

import { IBuilder, IFile, IBuilderCache } from "../../../interfaces";
import { ICache } from "../../../lib/cache";

export const buildCss: IBuilder = async (
  cache: ICache<IBuilderCache>,
  file: IFile
) => {
  const newFile = { ...file };
  newFile.raw = uglifyCssString(file.raw.toString());
  return newFile;
};
