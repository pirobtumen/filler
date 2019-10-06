import { rmdir, cmd, exists } from "../../src/lib/command/commands";

describe("Commands", () => {
  test("cmd - run command successfully", async () => {
    const cmdStr = `echo "hello world"`;
    const { stdout, stderr } = await cmd(cmdStr);
    expect(stderr).toBeFalsy();
    expect(typeof stdout).toBe("string");
    expect(stdout).toBe("hello world\n");
  });

  test("cmd - run command erroneusly", async () => {
    const cmdStr = `echo "hello world" 1>&2`;
    const { stdout, stderr } = await cmd(cmdStr);
    expect(stdout).toBeFalsy();
    expect(typeof stderr).toBe("string");
    expect(stderr).toBe("hello world\n");
  });

  test("rmdir - dir not exists", async () => {
    const dir = "not_exists_folder";
    expect(await rmdir(dir)).toBeTruthy();
  });

  test("rmdir - dir exists", async () => {
    const dir = "exists_folder";
    await cmd(`mkdir ${dir}`);
    expect(await rmdir(dir)).toBeTruthy();
    expect(await exists(dir)).toBeFalsy();
  });
});
