import { IFileMetadata } from "../interfaces";

export function getFileMetadata(fileRaw: string) {
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
