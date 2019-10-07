import { IConfig } from "./lib/interfaces";
import { Store } from "./lib/store";
import { Filler } from "./lib/filler";

export async function main(config: Partial<IConfig>) {
  const defaultConfig: IConfig = {
    templateFolder: "templates",
    postsFolder: "posts",
    publicFolder: "public",
    distFolder: "./dist",
    varsFolder: "vars",
    projectFolder: "",
    force: false,
    mode: "dev",
    recentPosts: 5
  };

  const store = new Store();
  store.set("config", { ...defaultConfig, ...config });

  const filler = new Filler(store);
  await filler.init();
  await filler.build();
}
