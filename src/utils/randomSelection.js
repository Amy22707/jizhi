const memory = new Map();

function draw(items, history, limit, key, weight = () => 1, random = Math.random) {
  const recent = Array.isArray(history)
    ? [...new Set(history.filter((id) => typeof id === 'string'))]
    : [];
  const window = recent.slice(0, limit);
  const rank = new Map(window.map((id, index) => [id, index]));
  let available = items.filter((item) => !rank.has(key(item)));
  if (!available.length && items.length) {
    available = [
      items.reduce((oldest, item) => (rank.get(key(item)) > rank.get(key(oldest)) ? item : oldest)),
    ];
  }
  const weights = available.map(weight);
  let roll = random() * weights.reduce((sum, value) => sum + value, 0);
  const item = available.find((candidate, i) => (roll -= weights[i]) < 0) || available[0];
  return {
    item,
    history: item ? [key(item), ...window.filter((id) => id !== key(item))].slice(0, limit) : [],
  };
}

function persistentDraw(name, items, limit, key, weight) {
  const storageKey = 'jizhi-enhanced-' + name;
  const select = () => {
    let history = memory.get(storageKey);
    try {
      if (!history) history = JSON.parse(localStorage.getItem(storageKey));
    } catch {
      // Unavailable or corrupt storage can start a new history.
    }
    const result = draw(items, history, limit, key, weight);
    try {
      localStorage.setItem(storageKey, JSON.stringify(result.history));
      memory.delete(storageKey);
    } catch {
      memory.set(storageKey, result.history);
    }
    return result.item;
  };
  // Serialize read/modify/write across concurrently opened extension tabs.
  return navigator.locks
    ? navigator.locks.request(storageKey, select).catch(select)
    : Promise.resolve(select());
}

module.exports = { draw, persistentDraw };
