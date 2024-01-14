export type CustomFile = {
  type: "file";
  blob: Blob;
  name: string;
  size: number;
  mime: string;
};
