import { Filler, IConfig } from "./lib/filler";

export async function main(config: Partial<IConfig>) {
  const filler = new Filler(config);
  await filler.build();
}
