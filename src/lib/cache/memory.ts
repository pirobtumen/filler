import { ICache } from "../../interfaces";

export class MemoryCache implements ICache {
  private data: { [key: string]: any } = {};

  public set(key: string, value: any) {
    this.data[key] = value;
  }

  public get(key: string) {
    return this.data[key];
  }
}
