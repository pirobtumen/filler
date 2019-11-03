import { ICache } from ".";

export class MemoryCache<T extends { [key: string]: any }>
  implements ICache<T> {
  private data: T;

  constructor(data: T) {
    this.data = data;
  }

  public set<K extends keyof T>(key: K, value: T[K]) {
    this.data[key] = value;
  }

  public get<K extends keyof T>(key: K): T[K] {
    return this.data[key];
  }
}
