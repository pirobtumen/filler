export interface ICache<T> {
  set: <K extends keyof T>(key: K, value: T[K]) => void;
  get: <K extends keyof T>(key: K) => T[K];
}
