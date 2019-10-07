import { Filler, IConfig } from "./lib/filler";
import { Store } from "./lib/store";

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
