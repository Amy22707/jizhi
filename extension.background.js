/* global browser, chrome */

// The toolbar button opens a browser new tab, which uses the manifest override.
const extension = typeof browser !== 'undefined' ? browser : chrome;
extension.action.onClicked.addListener(() => extension.tabs.create({}));
