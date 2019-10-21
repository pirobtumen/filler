export interface ICache {
  set: (key: string, value: any) => void;
  get: (key: string) => any;
}
