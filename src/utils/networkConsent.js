/* global browser */

export function firefoxDataPermissions() {
  return typeof browser !== 'undefined' &&
    browser.runtime &&
    browser.runtime.getManifest().browser_specific_settings?.gecko?.data_collection_permissions
    ? browser.permissions
    : undefined;
}

export async function requestDataConsent(type) {
  const permissions = firefoxDataPermissions();
  if (!permissions) return true;
  try {
    // Must be invoked directly from the user gesture in Firefox.
    return await permissions.request({ data_collection: [type] });
  } catch {
    return false;
  }
}
