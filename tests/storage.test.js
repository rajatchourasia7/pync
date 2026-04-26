const { resetStore } = require("./chrome-mock");
const {
  getMappings,
  getMapping,
  setMapping,
  deleteMapping,
} = require("../src/storage");

beforeEach(() => {
  resetStore();
});

describe("getMappings", () => {
  test("returns empty object when nothing is stored", async () => {
    const result = await getMappings();
    expect(result).toEqual({});
  });

  test("returns all stored mappings", async () => {
    await setMapping("jira", "https://jira.com");
    await setMapping("wiki", "https://wiki.com");
    const result = await getMappings();
    expect(result).toEqual({
      jira: "https://jira.com",
      wiki: "https://wiki.com",
    });
  });
});

describe("getMapping", () => {
  test("returns undefined for a non-existent short name", async () => {
    const result = await getMapping("missing");
    expect(result).toBeUndefined();
  });

  test("returns the URL for an existing short name", async () => {
    await setMapping("jira", "https://jira.com");
    const result = await getMapping("jira");
    expect(result).toBe("https://jira.com");
  });
});

describe("setMapping", () => {
  test("adds a new mapping", async () => {
    await setMapping("jira", "https://jira.com");
    const result = await getMapping("jira");
    expect(result).toBe("https://jira.com");
  });

  test("overwrites an existing mapping", async () => {
    await setMapping("jira", "https://old.com");
    await setMapping("jira", "https://new.com");
    const result = await getMapping("jira");
    expect(result).toBe("https://new.com");
  });
});

describe("deleteMapping", () => {
  test("removes an existing mapping", async () => {
    await setMapping("jira", "https://jira.com");
    await deleteMapping("jira");
    const result = await getMapping("jira");
    expect(result).toBeUndefined();
  });

  test("does not throw when deleting a non-existent mapping", async () => {
    await expect(deleteMapping("missing")).resolves.not.toThrow();
  });
});