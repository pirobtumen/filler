import { IConfig } from "./lib/interfaces";
import { Store } from "./lib/store";
import { Filler, Loader } from "./lib/filler";
import { Builder } from "./lib/builder";
import { defaultConfig } from "./config.default";

export async function main(config: Partial<IConfig>) {
  const store = new Store();
  store.set("config", { ...defaultConfig, ...config });

  const loader = new Loader(store);
  await loader.init();

  const builder = new Builder(store);
  const filler = new Filler(store, builder);
  await filler.build();
}
