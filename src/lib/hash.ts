import { createHash } from "crypto";

export enum HashAlgorithm {
  SHA256 = "sha256"
}

export function getHash(
  data: string,
  algorithm: HashAlgorithm = HashAlgorithm.SHA256
) {
  return createHash(algorithm)
    .update(data)
    .digest("base64");
}
