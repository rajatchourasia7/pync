const { resetStore } = require("./chrome-mock");
const { setMapping, getMapping } = require("../src/storage");
const {
  trySaveMapping,
  tryDeleteMapping,
  exportMappings,
  parseImportData,
  importMappings,
} = require("../popup/popup");

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

describe("tryDeleteMapping", () => {
  test("deletes an existing mapping", async () => {
    await setMapping("jira", "https://jira.com");
    const result = await tryDeleteMapping("jira");
    expect(result.status).toBe("success");
    expect(await getMapping("jira")).toBeUndefined();
  });

  test("returns success even when mapping does not exist", async () => {
    const result = await tryDeleteMapping("missing");
    expect(result.status).toBe("success");
  });

  test("returns error for empty shortname", async () => {
    const result = await tryDeleteMapping("");
    expect(result.status).toBe("error");
  });
});

describe("exportMappings", () => {
  test("returns empty object as JSON string when nothing stored", async () => {
    const result = await exportMappings();
    expect(JSON.parse(result)).toEqual({});
  });

  test("returns all mappings as JSON string", async () => {
    await setMapping("jira", "https://jira.com");
    await setMapping("wiki", "https://wiki.com");
    const result = await exportMappings();
    expect(JSON.parse(result)).toEqual({
      jira: "https://jira.com",
      wiki: "https://wiki.com",
    });
  });
});

describe("parseImportData", () => {
  test("returns parsed mappings for valid JSON", () => {
    const result = parseImportData(
      '{"jira": "https://jira.com", "wiki": "https://wiki.com"}'
    );
    expect(result).toEqual({
      jira: "https://jira.com",
      wiki: "https://wiki.com",
    });
  });

  test("throws for invalid JSON", () => {
    expect(() => parseImportData("not json")).toThrow();
  });

  test("throws for non-object root", () => {
    expect(() => parseImportData('"string"')).toThrow();
    expect(() => parseImportData("[1, 2]")).toThrow();
    expect(() => parseImportData("null")).toThrow();
  });

  test("throws if any value is not a string", () => {
    expect(() => parseImportData('{"jira": 42}')).toThrow();
  });

  test("throws if any value is not a valid URL", () => {
    expect(() => parseImportData('{"jira": "not-a-url"}')).toThrow();
  });

  test("throws for empty short name", () => {
    expect(() => parseImportData('{"": "https://jira.com"}')).toThrow();
  });
});

describe("importMappings", () => {
  test("saves new mappings", async () => {
    await importMappings({ jira: "https://jira.com" });
    expect(await getMapping("jira")).toBe("https://jira.com");
  });

  test("overwrites existing mappings on conflict", async () => {
    await setMapping("jira", "https://old.com");
    await importMappings({ jira: "https://new.com" });
    expect(await getMapping("jira")).toBe("https://new.com");
  });

  test("preserves existing mappings not in the import", async () => {
    await setMapping("wiki", "https://wiki.com");
    await importMappings({ jira: "https://jira.com" });
    expect(await getMapping("wiki")).toBe("https://wiki.com");
    expect(await getMapping("jira")).toBe("https://jira.com");
  });
});