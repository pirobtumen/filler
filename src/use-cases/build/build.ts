import { defaultConfig } from "./config.default";
import { Builder, defaultBuilders } from "../../domain/builder";
import { Loader } from "../../domain/loader";
import { Storer } from "../../domain/storer";
import { IConfig, IBuilderCache } from "../../interfaces";
import { MemoryCache } from "../../lib/cache";

export async function build(config: Partial<IConfig>) {
  const initCache: IBuilderCache = {
    config: { ...defaultConfig, ...config },
    templates: {},
    posts: [],
    snippets: {}
  };
  const cache = new MemoryCache<IBuilderCache>(initCache);
  const loader = new Loader(cache);
  const builder = new Builder(cache, defaultBuilders);
  const storer = new Storer(cache);

  await loader.init();

  const files = await builder.build();
  await storer.save(files);
}
