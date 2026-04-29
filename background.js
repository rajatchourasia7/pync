let storage;
if (typeof require !== "undefined") {
  storage = require("./src/storage");
} else {
  importScripts("src/storage.js");
  storage = self.pyncStorage;
}

async function handleOmniboxInput(text) {
  const shortname = text.trim();
  const url = await storage.getMapping(shortname);
  if (url) {
    chrome.tabs.update({ url });
  }
}

async function handleOmniboxInputChanged(text) {
  const shortname = text.trim();
  const url = await storage.getMapping(shortname);
  if (url) {
    chrome.omnibox.setDefaultSuggestion({
      description: `Open <url>${url}</url>`,
    });
  } else {
    chrome.omnibox.setDefaultSuggestion({
      description: `No mapping found for "${shortname}"`,
    });
  }
}

chrome.omnibox.onInputEntered.addListener(handleOmniboxInput);
chrome.omnibox.onInputChanged.addListener(handleOmniboxInputChanged);

if (typeof module !== "undefined") {
  module.exports = { handleOmniboxInput, handleOmniboxInputChanged };
}