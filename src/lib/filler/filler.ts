import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { processString as uglifyCssString } from "uglifycss";

import { DirScanner, IFile } from "../dir-scanner";
import { mkdir, unlink } from "../command";
import { IConfig, IPostMetadata } from "./interfaces";
import { getFileMetadata } from "./parser";

type StringObject = { [key: string]: string };

export class Filler {
  private config: IConfig = {
    templateFolder: "templates",
    postsFolder: "posts",
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
  private recentPosts: IPostMetadata[] = [];

  constructor(config: Partial<IConfig>) {
    this.setConfig(config);
    this.loadTemplates();
    this.loadVars();
  }

  private setConfig(config: Partial<IConfig>) {
    this.config = { ...this.config, ...config };
  }

  private async loadTemplates() {
    const templateFolder = join(
      this.config.projectFolder,
      this.config.templateFolder
    );
    const templates = (await DirScanner.scan(templateFolder)).getFiles();

    for (const file of templates) {
      const name = file.name.split(".")[0];
      this.templates[name] = file.raw.toString();
    }
  }

  private loadVars() {
    const varsFolder = join(this.config.projectFolder, this.config.varsFolder);
    this.vars["analytics"] = {
      configMode: "prod",
      value: readFileSync(join(varsFolder, "analytics.html")).toString()
    };
    this.vars["scripts"] = {
      configMode: "all",
      value: readFileSync(join(varsFolder, "scripts.html")).toString()
    };
  }

  private async saveFile(file: IFile) {
    const outFolder = join(this.config.distFolder, file.path);
    try {
      await mkdir(outFolder, { recursive: true });
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

  public async buildFile(file: IFile) {
    switch (file.extension) {
      case "html":
        const { metadata, html: content } = getFileMetadata(
          file.raw.toString()
        );
        let output = "";

        if (metadata.template) {
          output = this.templates[metadata.template];

          output = output.replace("{{content}}", content);
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
    await mkdir(this.config.distFolder, { recursive: true });

    let filesUpdated = 0;
    const posts = (await DirScanner.scan(
      join(this.config.projectFolder, this.config.postsFolder)
    ))
      .getFiles()
      .map(p => ({ ...p, path: this.config.postsFolder }));

    for (const post of posts) {
      const { metadata } = getFileMetadata(post.raw.toString());
      // TODO validation
      const [day, month, year] = metadata
        .date!.split("-")
        .map(d => parseInt(d));

      const postMetadata: IPostMetadata = {
        title: metadata.title!,
        description: metadata.description!,
        author: metadata.author!,
        createdAt: new Date(year, month - 1, day, 0, 0, 0, 0)
      };
      this.recentPosts.push(postMetadata);
    }

    const publicFiles = [
      ...(await DirScanner.scan(
        join(this.config.projectFolder, this.config.publicFolder)
      )).getFiles(),
      ...posts
    ];
    const distFiles = (await DirScanner.scan(
      this.config.distFolder
    )).getFiles();

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
      await unlink(filePath);
      console.log(`- ${filePath}`);
      filesUpdated += 1;
    }

    if (filesUpdated === 0) {
      console.log("WARNING: Any file was updated.");
    }
  }
}
