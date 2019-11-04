import { IPostMetadata } from "../../../interfaces";

export const postSorter = (p1: IPostMetadata, p2: IPostMetadata) => {
  const d1 = p1.createdAt;
  const d2 = p2.createdAt;

  if (d1 > d2) return -1;
  else if (d1 === d2) return 0;
  else return 1;
};
