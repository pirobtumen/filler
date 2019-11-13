import { HashAlgorithm, getHash } from "../../src/lib/hash";

describe("Hash", () => {
  test("Check HashAlgorithm values", async () => {
    expect(HashAlgorithm.SHA256).toEqual("sha256");
  });

  test("Check SHA256 hash", async () => {
    const hash = getHash("hello-hash-sha");
    expect(hash).toEqual("DiNLd0saBUPkchpd31Sw7UFvl/5MlRmcsbCmnD3MgIA=");
  });
});
