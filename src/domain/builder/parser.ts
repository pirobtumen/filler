import { IFileMetadata, IFile, IConfig, IPostMetadata } from "../../interfaces";
import { join } from "path";

export function getFileMetadata(file: IFile) {
  const fileRaw = file.raw.toString().trim();
  const startsWithComment = fileRaw.startsWith("<!--");
  const endIndex = fileRaw.indexOf("-->");
  const metadata: IFileMetadata = {};
  let html: string = "";

  if (startsWithComment && endIndex > -1) {
    const endPos = endIndex + 3;
    const metadataRaw = fileRaw.substr(0, endPos);
    const metadataRegex = /@(\w+) (.+\n)/gm;

    let match = metadataRegex.exec(metadataRaw);
    while (match) {
      metadata[match[1]] = match[2].trim();
      match = metadataRegex.exec(metadataRaw);
    }

    html = fileRaw.substr(endPos);
  } else {
    html = fileRaw;
  }

  return { metadata, html };
}

export const getPostMetadata = (config: IConfig, post: IFile) => {
  const { metadata } = getFileMetadata(post);
  let day: number, month: number, year: number;

  if (metadata.date) {
    [day, month, year] = metadata.date.split("-").map(d => parseInt(d));
  } else {
    throw new Error(
      `Post without date property. Check file ${post.path}/${post.name}.${post.extension}`
    );
  }

  const postMedata: IPostMetadata = {
    title: metadata.title!,
    description: metadata.description!,
    author: metadata.author!,
    date: metadata.date!,
    createdAt: new Date(year, month - 1, day, 0, 0, 0, 0),
    href: `${join(config.postsFolder, post.path, post.name)}.html`
  };

  return postMedata;
};
