import { defaultConfig } from "./config.default";
import { Builder, defaultBuilders } from "../../domain/builder";
import { Loader } from "../../domain/loader";
import { Storer } from "../../domain/storer";
import { IConfig } from "../../interfaces";
import { MemoryCache } from "../../lib/cache";

export async function build(config: Partial<IConfig>) {
  const cache = new MemoryCache();
  const loader = new Loader(cache);
  const builder = new Builder(cache, defaultBuilders);
  const storer = new Storer(cache);

  cache.set("config", { ...defaultConfig, ...config });
  await loader.init();

  const files = await builder.build();
  await storer.save(files);
}
