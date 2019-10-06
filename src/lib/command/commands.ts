import { promisify } from "util";
import { exists as _exists } from "fs";
import { exec as _exec } from "child_process";

import { ICmdResult } from ".";

const exec = promisify(_exec);
export const exists = promisify(_exists);

export async function cmd(cmd: string): Promise<ICmdResult> {
  const { stdout, stderr } = await exec(cmd);
  return { stdout, stderr };
}

export async function rmdir(dir: string) {
  if (!(await exists(dir))) {
    return true;
  }

  await cmd(`rm -r ${dir}`);

  return true;
}
