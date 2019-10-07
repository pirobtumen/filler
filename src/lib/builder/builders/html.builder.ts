import { IBuilder, IFile, IStore } from "../../interfaces";
import { getFileMetadata } from "..";

export const htmlBuilder: IBuilder = async (store: IStore, file: IFile) => {
  const config = store.get("config");
  const templates = store.get("templates");
  const vars = store.get("vars");

  const newFile = { ...file };
  const { metadata, html: content } = getFileMetadata(file.raw.toString());
  let output = "";

  if (metadata.template) {
    output = templates[metadata.template];

    output = output.replace("{{content}}", content);
  } else {
    output = content;
  }

  const templateVars = output.match(/{{var:(.*)}}/g);
  if (templateVars) {
    templateVars
      .map(v => v.slice(6, -2))
      .forEach((n, i) => {
        const varValue =
          config.mode === vars[n].configMode || vars[n].configMode === "all"
            ? vars[n].value
            : "";

        output = output.replace(templateVars[i], varValue);
      });
  }

  file.raw = output;
  return newFile;
};
