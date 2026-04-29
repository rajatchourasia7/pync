const store = {};

const chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        const result = {};
        const keyList = Array.isArray(keys) ? keys : [keys];
        keyList.forEach((key) => {
          if (store[key] !== undefined) {
            result[key] = store[key];
          }
        });
        if (callback) callback(result);
        return Promise.resolve(result);
      }),
      set: jest.fn((items, callback) => {
        Object.assign(store, items);
        if (callback) callback();
        return Promise.resolve();
      }),
    },
  },
  omnibox: {
    onInputEntered: {
      addListener: jest.fn(),
    },
    onInputChanged: {
      addListener: jest.fn(),
    },
    setDefaultSuggestion: jest.fn(),
  },
  tabs: {
    update: jest.fn(),
  },
};

function resetStore() {
  Object.keys(store).forEach((key) => delete store[key]);
}

global.chrome = chrome;

module.exports = { chrome, store, resetStore };