import { mkdirSync, writeFileSync, unlinkSync, readFileSync } from "fs";
import { join } from "path";
import { processString as uglifyCssString } from "uglifycss";

import { IConfig } from ".";
import { version } from "../../../package.json";
import { DirScanner, IFile } from "../dir-scanner";

type StringObject = { [key: string]: string };

export interface IFillerMetadata {
  template?: string | null;
}

export interface IFillerFile {
  file: IFile;
  metadata?: IFillerMetadata;
  parsed?: string;
}

export class Filler {
  private config: IConfig = {
    templateFolder: "templates",
    publicFolder: "public",
    distFolder: "./dist",
    varsFolder: "vars",
    projectFolder: "",
    force: false,
    mode: "dev"
  };
  private templates: StringObject = {};
  private vars: {
    [key: string]: { configMode: "prod" | "dev" | "all"; value: string };
  } = {};

  constructor(config: IConfig) {
    this.setConfig(config);
    this.loadTemplates();
    this.loadVars();
  }

  private setConfig(config: IConfig) {
    const newConfig = { ...config };
    newConfig.publicFolder =
      newConfig.projectFolder + "/" + newConfig.publicFolder;
    newConfig.varsFolder = newConfig.projectFolder + "/" + newConfig.varsFolder;
    newConfig.templateFolder =
      newConfig.projectFolder + "/" + newConfig.templateFolder;
    this.config = newConfig;
  }

  private async loadTemplates() {
    const dirScan = await DirScanner.explore(this.config.templateFolder);
    const templates = dirScan.getFiles();

    for (const file of templates) {
      const name = file.name.split(".")[0];
      this.templates[name] = file.raw.toString();
    }
  }

  private loadVars() {
    this.vars["analytics"] = {
      configMode: "prod",
      value: readFileSync(
        join(this.config.varsFolder, "analytics.html")
      ).toString()
    };
    this.vars["scripts"] = {
      configMode: "all",
      value: readFileSync(
        join(this.config.varsFolder, "scripts.html")
      ).toString()
    };
  }

  private saveFile(file: IFile) {
    const outFolder = join(this.config.distFolder, file.path);
    try {
      mkdirSync(outFolder, { recursive: true });
    } catch (e) {
      console.log(e);
    }

    const content = file.raw;
    if (!content) {
      // TODO Show warnings at the end of the file
      console.log(`WARNING: Empty file ${file.path} `);
    }

    const outFilePath = join(outFolder, file.name);
    console.log(`+ ${outFilePath}`);
    writeFileSync(outFilePath, content);
  }

  private parseTemplateFile(fileRaw: string) {
    const startsWithComment = fileRaw.startsWith("<!--");
    const index = fileRaw.indexOf("-->");
    const metadata: IFillerMetadata = {};
    let html: string;

    if (startsWithComment && index > -1) {
      const endPos = index + 3;
      const metdataRaw = fileRaw.substr(0, endPos);
      const template = metdataRaw.match(/@template (.+)/);
      if (template && template[1] !== "none") {
        metadata.template = template[1];
      } else {
        metadata.template = null;
      }

      html = fileRaw.substr(endPos);
    } else {
      html = fileRaw;
    }

    if (metadata.template === undefined) {
      console.log(
        "WARNING: @template not defined. Use @template none instead."
      );
    }

    return { metadata, html };
  }

  public async buildFile(file: IFile) {
    switch (file.extension) {
      case "html":
        const { metadata, html: content } = this.parseTemplateFile(
          file.raw.toString()
        );
        let output = "";

        if (metadata.template) {
          output = this.templates[metadata.template];

          output = output.replace("{{content}}", content);
          output = output.replace("{{version}}", version);
        } else {
          output = content;
        }

        const vars = output.match(/{{var:(.*)}}/g);
        if (vars) {
          vars
            .map(v => v.slice(6, -2))
            .forEach((n, i) => {
              const varValue =
                this.config.mode === this.vars[n].configMode ||
                this.vars[n].configMode === "all"
                  ? this.vars[n].value
                  : "";

              output = output.replace(vars[i], varValue);
            });
        }

        file.raw = output;
        break;
      case "css":
        file.raw = uglifyCssString(file.raw.toString());
        break;
    }

    return file;
  }

  public async build() {
    let filesUpdated = 0;
    const publicDir = await DirScanner.explore(this.config.publicFolder);
    const publicFiles = publicDir.getFiles();

    mkdirSync(this.config.distFolder, { recursive: true });
    const distDir = await DirScanner.explore(this.config.distFolder);
    const distFiles = distDir.getFiles();

    for (const pf of publicFiles) {
      const distFileIndex = distFiles.findIndex(
        df => df.name === pf.name && df.path === pf.path
      );

      if (
        distFileIndex === -1 ||
        pf.modifiedAt > distFiles[distFileIndex].modifiedAt ||
        this.config.force
      ) {
        const file = await this.buildFile(pf);
        this.saveFile(file);
        filesUpdated += 1;
      }

      if (distFileIndex > -1) {
        distFiles.splice(distFileIndex, 1);
      }
    }

    for (const f of distFiles) {
      const filePath = join(this.config.distFolder, f.path, f.name);
      unlinkSync(filePath);
      console.log(`- ${filePath}`);
      filesUpdated += 1;
    }

    if (filesUpdated === 0) {
      console.log("WARNING: Any file was updated.");
    }
  }
}
