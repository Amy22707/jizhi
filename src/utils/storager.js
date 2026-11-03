const storageLocal = {
  name: 'localStorage',
  set: (obj, callback) => {
    const key = Object.keys(obj)[0];
    const output = {};
    output[key] = obj[key];
    const value = JSON.stringify(output);
    try {
      localStorage.setItem(key, value);
    } catch {
      // Settings remain usable for this tab if storage is full.
    }
    if (callback) callback();
  },
  get: (keys, callback) => {
    let resOutput = {};
    keys.forEach((key) => {
      try {
        const result = JSON.parse(localStorage.getItem(key));
        if (result && typeof result === 'object') resOutput[key] = result[key];
      } catch {
        // Ignore damaged or inaccessible settings.
      }
    });

    if (callback) callback(resOutput);
  },
};

// Default using: chrome.storage.sync
// eslint-disable-next-line no-undef
// const storager = process.env.NODE_ENV === 'development' ? storageLocal : chrome.storage.local;
const storager = storageLocal;

export default storager;
