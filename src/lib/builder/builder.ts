import { processString as uglifyCssString } from "uglifycss";

import { IFileMetadata } from "./interfaces";
import { IFile } from "../dir-scanner";
import { Store } from "../store";

export class Builder {
  constructor(private store: Store) {}

  public static getFileMetadata(fileRaw: string) {
    const startIndex = fileRaw.indexOf("<!--");
    const endIndex = fileRaw.indexOf("-->");
    const metadata: IFileMetadata = {};
    let html: string = "";

    if (startIndex > -1 && endIndex > -1 && endIndex > startIndex) {
      const endPos = endIndex + 3;
      const metadataRaw = fileRaw.substr(0, endPos);
      const metadataRegex = /@(\w+) ([\w,-]+)/gm;

      let match = metadataRegex.exec(metadataRaw);
      while (match) {
        metadata[match[1]] = match[2];
        match = metadataRegex.exec(metadataRaw);
      }

      html = fileRaw.substr(endPos);
    } else {
      throw new Error(`Parser: file XXX metadata is not correct.`);
    }

    return { metadata, html };
  }

  public async buildFile(file: IFile) {
    const config = this.store.get("config");
    const templates = this.store.get("templates");
    const vars = this.store.get("vars");

    switch (file.extension) {
      case "html":
        const { metadata, html: content } = Builder.getFileMetadata(
          file.raw.toString()
        );
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
                config.mode === vars[n].configMode ||
                vars[n].configMode === "all"
                  ? vars[n].value
                  : "";

              output = output.replace(templateVars[i], varValue);
            });
        }

        file.raw = output;
        break;
      case "css":
        file.raw = uglifyCssString(file.raw.toString());
        break;
    }

    return file;
  }
}
