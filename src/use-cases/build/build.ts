import { IConfig } from "../../interfaces";
import { Store } from "../../lib/store";
import { Filler, Loader } from "../../domain/filler";
import { Builder, defaultBuilders } from "../../domain/builder";
import { defaultConfig } from "./config.default";

export async function build(config: Partial<IConfig>) {
  const store = new Store();
  store.set("config", { ...defaultConfig, ...config });

  const loader = new Loader(store);
  await loader.init();

  const builder = new Builder(store, defaultBuilders);
  const filler = new Filler(store, builder);
  await filler.build();
}
