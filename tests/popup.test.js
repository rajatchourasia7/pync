const { resetStore } = require("./chrome-mock");
const { setMapping, getMapping } = require("../src/storage");
const { trySaveMapping } = require("../popup/popup");

beforeEach(() => {
  resetStore();
});

describe("trySaveMapping", () => {
  test("saves a new mapping when shortname does not exist", async () => {
    const result = await trySaveMapping("jira", "https://jira.com");
    expect(result.status).toBe("success");
    expect(await getMapping("jira")).toBe("https://jira.com");
  });

  test("returns duplicate status without saving when shortname exists", async () => {
    await setMapping("jira", "https://old.com");
    const result = await trySaveMapping("jira", "https://new.com");
    expect(result.status).toBe("duplicate");
    expect(result.shortname).toBe("jira");
    expect(await getMapping("jira")).toBe("https://old.com");
  });

  test("overwrites when overwrite option is true", async () => {
    await setMapping("jira", "https://old.com");
    const result = await trySaveMapping("jira", "https://new.com", {
      overwrite: true,
    });
    expect(result.status).toBe("success");
    expect(await getMapping("jira")).toBe("https://new.com");
  });

  test("returns error for empty shortname", async () => {
    const result = await trySaveMapping("", "https://jira.com");
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/short name/i);
  });

  test("returns error for whitespace-only shortname", async () => {
    const result = await trySaveMapping("   ", "https://jira.com");
    expect(result.status).toBe("error");
  });

  test("returns error for invalid URL", async () => {
    const result = await trySaveMapping("jira", "not-a-url");
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/url/i);
  });

  test("trims shortname before saving", async () => {
    const result = await trySaveMapping("  jira  ", "https://jira.com");
    expect(result.status).toBe("success");
    expect(await getMapping("jira")).toBe("https://jira.com");
    expect(await getMapping("  jira  ")).toBeUndefined();
  });
});