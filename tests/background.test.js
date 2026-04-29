const { resetStore, chrome } = require("./chrome-mock");
const { setMapping } = require("../src/storage");

let handleOmniboxInput;
let handleOmniboxInputChanged;

beforeEach(() => {
  resetStore();
  jest.resetModules();
  chrome.tabs.update.mockClear();
  chrome.omnibox.onInputEntered.addListener.mockClear();
  chrome.omnibox.onInputChanged.addListener.mockClear();
  chrome.omnibox.setDefaultSuggestion.mockClear();
  ({ handleOmniboxInput, handleOmniboxInputChanged } = require("../background"));
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

describe("handleOmniboxInputChanged", () => {
  test("shows the mapped URL as default suggestion when shortname exists", async () => {
    await setMapping("jira", "https://jira.com");
    await handleOmniboxInputChanged("jira");
    expect(chrome.omnibox.setDefaultSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining("https://jira.com"),
      })
    );
  });

  test("shows a 'no mapping' suggestion when shortname does not exist", async () => {
    await handleOmniboxInputChanged("missing");
    expect(chrome.omnibox.setDefaultSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringMatching(/no mapping/i),
      })
    );
  });

  test("trims whitespace before lookup", async () => {
    await setMapping("jira", "https://jira.com");
    await handleOmniboxInputChanged("  jira  ");
    expect(chrome.omnibox.setDefaultSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining("https://jira.com"),
      })
    );
  });
});

describe("listener registration", () => {
  test("registers handleOmniboxInput on chrome.omnibox.onInputEntered", () => {
    expect(chrome.omnibox.onInputEntered.addListener).toHaveBeenCalledWith(
      handleOmniboxInput
    );
  });

  test("registers handleOmniboxInputChanged on chrome.omnibox.onInputChanged", () => {
    expect(chrome.omnibox.onInputChanged.addListener).toHaveBeenCalledWith(
      handleOmniboxInputChanged
    );
  });
});