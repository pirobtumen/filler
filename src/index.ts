import * as yargs from "yargs";

import { main } from "./main";
import { IConfig } from "./lib/interfaces";

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

const config: Partial<IConfig> = {
  projectFolder: argv.f,
  force: argv.force,
  mode: "dev"
};

main(config);
