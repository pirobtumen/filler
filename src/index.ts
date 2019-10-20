import { ArgumentParser } from "argparse";

import { version } from "../package.json";
import { build } from "./use-cases";
import { IConfig } from "./interfaces";

const parser = new ArgumentParser({
  version: version,
  addHelp: true,
  description: "Modern websites generation made easy"
});

const subparsers = parser.addSubparsers({
  title: "Commands",
  dest: "command"
});

const buildCmd = subparsers.addParser("build", {
  addHelp: true,
  description: "Build project folder"
});
buildCmd.addArgument(["folder"]);
buildCmd.addArgument(["--mode"], {
  action: "store",
  help: "Build mode",
  defaultValue: "dev"
});
buildCmd.addArgument(["--force"], {
  action: "storeTrue",
  help: "Force build all files"
});
buildCmd.addArgument(["--recentPosts"], {
  action: "store",
  help: "Number of recent posts to render"
});

const args = parser.parseArgs();
switch (args.command) {
  case "build":
    // TODO Validation
    const config: Partial<IConfig> = {
      mode: args.mode,
      force: args.force,
      projectFolder: args.folder
    };

    if (args.recentPosts) {
      config.recentPosts = args.recentPosts;
    }

    build(config);
    break;
  default:
    parser.printHelp();
    break;
}
