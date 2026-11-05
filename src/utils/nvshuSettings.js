// Preserve preferences written by releases using the previous spelling.
const previousKeys = {
  showNushuOriginal: 'showNvshuOriginal',
  showNushuColorOriginal: 'showNvshuColorOriginal',
  nushuOriginalScript: 'nvshuOriginalScript',
  nushuOriginalFont: 'nvshuOriginalFont',
};

function migrateNvshuSettings(saved) {
  const settings = { ...saved };
  for (const [previous, current] of Object.entries(previousKeys)) {
    if (
      !Object.prototype.hasOwnProperty.call(settings, current) &&
      Object.prototype.hasOwnProperty.call(settings, previous)
    ) {
      settings[current] = settings[previous];
    }
    delete settings[previous];
  }
  return settings;
}

module.exports = { migrateNvshuSettings };
