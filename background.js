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

chrome.omnibox.onInputEntered.addListener(handleOmniboxInput);

if (typeof module !== "undefined") {
  module.exports = { handleOmniboxInput };
}