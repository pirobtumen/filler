import { DirScanner } from "../../src/lib/dir-scanner";

describe("DirScanner", () => {
  test("Folder does not exist", async () => {
    const dir = "no_folder";
    expect(DirScanner.scan(dir)).rejects.toThrowError();
  });

  test("Folder exists", async () => {
    const dir = "./test/data/dir-scanner";
    const scanner = await DirScanner.scan(dir);
    const files = scanner.getFiles();
    expect(files).toBeTruthy();
    expect(files.length).toBe(2);
    expect(files[0].name).toBe("text.txt");
    expect(files[1].name).toBe("text2.txt");
  });
});
