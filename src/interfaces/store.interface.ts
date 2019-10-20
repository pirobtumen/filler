export interface IStore {
  set: (key: string, value: any) => void;
  get: (key: string) => any;
}
