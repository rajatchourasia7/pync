const STORAGE_KEY = "mappings";

async function getMappings() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || {};
}

async function getMapping(shortname) {
  const mappings = await getMappings();
  return mappings[shortname];
}

async function setMapping(shortname, url) {
  const mappings = await getMappings();
  mappings[shortname] = url;
  await chrome.storage.local.set({ [STORAGE_KEY]: mappings });
}

async function hasMapping(shortname) {
  const mappings = await getMappings();
  return Object.prototype.hasOwnProperty.call(mappings, shortname);
}

async function deleteMapping(shortname) {
  const mappings = await getMappings();
  delete mappings[shortname];
  await chrome.storage.local.set({ [STORAGE_KEY]: mappings });
}

if (typeof module !== "undefined") {
  module.exports = {
    getMappings,
    getMapping,
    setMapping,
    deleteMapping,
    hasMapping,
  };
}