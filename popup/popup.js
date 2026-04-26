let storage;
if (typeof require !== "undefined") {
  storage = require("../src/storage");
} else {
  storage = self.pyncStorage;
}

function isValidShortname(shortname) {
  return typeof shortname === "string" && shortname.trim().length > 0;
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function trySaveMapping(shortname, url, { overwrite = false } = {}) {
  if (!isValidShortname(shortname)) {
    return { status: "error", message: "Short name cannot be empty" };
  }
  if (!isValidUrl(url)) {
    return { status: "error", message: "Invalid URL" };
  }
  const trimmed = shortname.trim();
  if (!overwrite && (await storage.hasMapping(trimmed))) {
    return { status: "duplicate", shortname: trimmed };
  }
  await storage.setMapping(trimmed, url);
  return { status: "success", shortname: trimmed };
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-form");
    const shortnameInput = document.getElementById("shortname-input");
    const urlInput = document.getElementById("url-input");
    const message = document.getElementById("message");

    function showMessage(text, type) {
      message.textContent = text;
      message.className = `message ${type}`;
    }

    async function handleSave(overwrite) {
      const shortname = shortnameInput.value;
      const url = urlInput.value;
      const result = await trySaveMapping(shortname, url, { overwrite });

      if (result.status === "duplicate") {
        const ok = confirm(
          `Short name "${result.shortname}" already exists. Overwrite?`
        );
        if (ok) {
          await handleSave(true);
        }
        return;
      }

      if (result.status === "error") {
        showMessage(result.message, "error");
        return;
      }

      showMessage(`Saved "${result.shortname}"`, "success");
      shortnameInput.value = "";
      urlInput.value = "";
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSave(false);
    });
  });
}

if (typeof module !== "undefined") {
  module.exports = { trySaveMapping, isValidShortname, isValidUrl };
}