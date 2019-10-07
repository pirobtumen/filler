import { promisify } from "util";
import { exists as _exists, mkdir as _mkdir, unlink as _unlink } from "fs";
import { exec as _exec } from "child_process";

export const exists = promisify(_exists);
export const mkdir = promisify(_mkdir);
export const unlink = promisify(_unlink);
