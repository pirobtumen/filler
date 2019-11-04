import { DirScanner } from "../../src/lib/dir-scanner";

describe("DirScanner", () => {
  test("Folder does not exist", async () => {
    const dir = "no_folder";
    expect(DirScanner.scanAndGetFiles(dir)).rejects.toThrowError();
  });

  test("Folder exists", async () => {
    const dir = "./test/data/dir-scanner";
    const files = await DirScanner.scanAndGetFiles(dir);
    expect(files).toBeTruthy();
    expect(files.length).toBe(3);
    expect(files[0].name).toBe("text");
    expect(files[0].extension).toBe("txt");
    expect(files[0].path).toBe("");
    expect(files[2].name).toBe("post");
    expect(files[2].extension).toBe("md");
    expect(files[2].path).toBe("subfolder");
    expect(files[1].name).toBe("executable");
    expect(files[1].extension).toBe("");
    expect(files[1].path).toBe("subfolder");
  });
});
