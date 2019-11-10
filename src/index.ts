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
  type: "string",
  choices: ["dev", "prod"]
});
buildCmd.addArgument(["--force"], {
  action: "storeTrue",
  help: "Force build all files"
});
buildCmd.addArgument(["--recentPosts"], {
  action: "store",
  help: "Number of recent posts to render",
  type: "int"
});
buildCmd.addArgument(["--output", "-o"], {
  action: "store",
  help: "Output folder",
  type: "string"
});
buildCmd.addArgument(["--postsFolder"], {
  action: "store",
  help: "Posts folder",
  type: "string"
});

const args = parser.parseArgs();
switch (args.command) {
  case "build":
    const config: Partial<IConfig> = {
      force: args.force,
      projectFolder: args.folder
    };

    if (args.mode) {
      config.mode = args.mode;
    }

    if (args.output) {
      config.distFolder = args.output;
    }

    if (args.recentPosts) {
      config.recentPosts = args.recentPosts;
    }

    if (args.postsFolder) {
      config.postsFolder = args.postsFolder;
    }

    build(config);
    break;
  default:
    parser.printHelp();
    break;
}
