import * as yargs from "yargs";

import { main } from "./main";
import { IConfig } from "./lib/interfaces";

const argv = yargs
  .options({
    folder: {
      type: "string",
      alias: "f",
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
  projectFolder: argv.folder,
  force: argv.force,
  mode: "dev"
};

main(config);
