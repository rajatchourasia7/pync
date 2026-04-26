const { resetStore, chrome } = require("./chrome-mock");
const { setMapping } = require("../src/storage");

let handleOmniboxInput;

beforeEach(() => {
  resetStore();
  jest.resetModules();
  chrome.tabs.update.mockClear();
  chrome.omnibox.onInputEntered.addListener.mockClear();
  ({ handleOmniboxInput } = require("../background"));
});

describe("handleOmniboxInput", () => {
  test("redirects to the mapped URL when short name exists", async () => {
    await setMapping("jira", "https://jira.com");
    await handleOmniboxInput("jira");
    expect(chrome.tabs.update).toHaveBeenCalledWith({ url: "https://jira.com" });
  });

  test("does not redirect when short name does not exist", async () => {
    await handleOmniboxInput("missing");
    expect(chrome.tabs.update).not.toHaveBeenCalled();
  });

  test("trims whitespace from the input", async () => {
    await setMapping("jira", "https://jira.com");
    await handleOmniboxInput("  jira  ");
    expect(chrome.tabs.update).toHaveBeenCalledWith({ url: "https://jira.com" });
  });
});

describe("listener registration", () => {
  test("registers handleOmniboxInput on chrome.omnibox.onInputEntered", () => {
    expect(chrome.omnibox.onInputEntered.addListener).toHaveBeenCalledWith(
      handleOmniboxInput
    );
  });
});