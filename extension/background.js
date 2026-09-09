importScripts("shared.js");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "bright-open-code",
    title: 'Open "%s" in Bright',
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "bright-open-code") return;
  const code = brightExtractCode(info.selectionText || "") || (info.selectionText || "").trim();
  if (!code) return;
  brightGetBaseUrl((baseUrl) => {
    chrome.tabs.create({ url: brightBuildGoUrl(baseUrl, code) });
  });
});
