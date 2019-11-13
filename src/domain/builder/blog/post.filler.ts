import { IPostMetadata } from "../../../interfaces";

export const fillPostMetadata = (
  content: string,
  postMetadata: IPostMetadata
) => {
  return content
    .replace("{{title}}", postMetadata.title)
    .replace("{{author}}", postMetadata.author)
    .replace("{{date}}", postMetadata.date)
    .replace("{{description}}", postMetadata.description)
    .replace("{{href}}", `/${postMetadata.href}`);
};
