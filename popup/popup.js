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

async function tryDeleteMapping(shortname) {
  if (!isValidShortname(shortname)) {
    return { status: "error", message: "Invalid short name" };
  }
  await storage.deleteMapping(shortname.trim());
  return { status: "success", shortname: shortname.trim() };
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-form");
    const formHeading = document.getElementById("form-heading");
    const shortnameInput = document.getElementById("shortname-input");
    const urlInput = document.getElementById("url-input");
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const message = document.getElementById("message");
    const list = document.getElementById("mappings-list");

    let editingShortname = null;

    function showMessage(text, type) {
      message.textContent = text;
      message.className = `message ${type}`;
    }

    function clearMessage() {
      message.textContent = "";
      message.className = "message";
    }

    function enterEditMode(shortname, url) {
      editingShortname = shortname;
      shortnameInput.value = shortname;
      shortnameInput.readOnly = true;
      urlInput.value = url;
      formHeading.textContent = "Edit mapping";
      saveBtn.textContent = "Update";
      cancelBtn.hidden = false;
      clearMessage();
      urlInput.focus();
    }

    function exitEditMode() {
      editingShortname = null;
      shortnameInput.value = "";
      shortnameInput.readOnly = false;
      urlInput.value = "";
      formHeading.textContent = "Add new mapping";
      saveBtn.textContent = "Save";
      cancelBtn.hidden = true;
    }

    async function renderList() {
      const mappings = await storage.getMappings();
      const entries = Object.entries(mappings).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      list.innerHTML = "";

      if (entries.length === 0) {
        const li = document.createElement("li");
        li.className = "empty";
        li.textContent = "No mappings yet.";
        list.appendChild(li);
        return;
      }

      for (const [shortname, url] of entries) {
        const li = document.createElement("li");

        const info = document.createElement("div");
        info.className = "mapping-info";
        const name = document.createElement("span");
        name.className = "mapping-shortname";
        name.textContent = shortname;
        const urlSpan = document.createElement("span");
        urlSpan.className = "mapping-url";
        urlSpan.textContent = url;
        info.appendChild(name);
        info.appendChild(urlSpan);

        const actions = document.createElement("div");
        actions.className = "mapping-actions";
        const editBtn = document.createElement("button");
        editBtn.className = "secondary";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => enterEditMode(shortname, url));
        const delBtn = document.createElement("button");
        delBtn.className = "danger";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => handleDelete(shortname));
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        li.appendChild(info);
        li.appendChild(actions);
        list.appendChild(li);
      }
    }

    async function handleSave(overwrite) {
      const shortname = shortnameInput.value;
      const url = urlInput.value;
      const forceOverwrite = overwrite || editingShortname !== null;
      const result = await trySaveMapping(shortname, url, {
        overwrite: forceOverwrite,
      });

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

      const verb = editingShortname ? "Updated" : "Saved";
      showMessage(`${verb} "${result.shortname}"`, "success");
      exitEditMode();
      await renderList();
    }

    async function handleDelete(shortname) {
      const ok = confirm(`Delete mapping "${shortname}"?`);
      if (!ok) return;
      const result = await tryDeleteMapping(shortname);
      if (result.status === "error") {
        showMessage(result.message, "error");
        return;
      }
      if (editingShortname === shortname) {
        exitEditMode();
      }
      showMessage(`Deleted "${shortname}"`, "success");
      await renderList();
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSave(false);
    });

    cancelBtn.addEventListener("click", () => {
      exitEditMode();
      clearMessage();
    });

    renderList();
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    trySaveMapping,
    tryDeleteMapping,
    isValidShortname,
    isValidUrl,
  };
}