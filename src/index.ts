import * as yargs from "yargs";

import { main } from "./main";
import { IConfig } from "./lib/filler";

const argv = yargs
  .options({
    f: {
      type: "string",
      alias: "folder",
      demandOption: true,
      description: "Project folder"
    },
    force: {
      type: "boolean",
      description: "Compile all files",
      default: false
    }
  })
  .parse();

const config: IConfig = {
  templateFolder: "templates",
  publicFolder: "public",
  distFolder: "./dist",
  varsFolder: "vars",
  projectFolder: argv.f,
  force: argv.force,
  mode: "dev"
};

main(config);