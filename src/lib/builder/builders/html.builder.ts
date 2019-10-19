import { IBuilder, IFile, IStore, IPostMetadata } from "../../interfaces";
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

  const recentPosts = output.match(/{{blog:recent-posts}}/g);
  if (recentPosts) {
    output = output.replace("{{blog:recent-posts}}", buildRecentPosts(store));
  }

  const templateVars = output.match(/{{var:([a-z0-9-]*)}}/g);
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

  newFile.raw = output;
  return newFile;
};

const buildRecentPosts = (store: IStore) => {
  const config = store.get("config");
  const posts = store.get("posts");

  return posts
    .map((post: IFile) => {
      const { metadata } = getFileMetadata(post.raw.toString());
      // TODO validation
      const [day, month, year] = metadata
        .date!.split("-")
        .map(d => parseInt(d));

      return {
        title: metadata.title!,
        description: metadata.description!,
        author: metadata.author!,
        createdAt: new Date(year, month - 1, day, 0, 0, 0, 0)
      } as IPostMetadata;
    })
    .sort((p1: IPostMetadata, p2: IPostMetadata) => {
      const d1 = p1.createdAt;
      const d2 = p2.createdAt;

      if (d1 > d2) return -1;
      else if (d1 === d2) return 0;
      else return 1;
    })
    .slice(0, config.recentPosts)
    .map((p: IPostMetadata) => {
      return "post-title";
    })
    .join();
};
