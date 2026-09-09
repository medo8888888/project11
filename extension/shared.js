// Shared across background.js, popup.js, options.js and content.js.
// Plain script (no bundler) — everything hangs off `window.BrightShared`
// in page contexts, or is just called directly in the service worker via
// importScripts().

const BRIGHT_DEFAULT_BASE_URL = "https://bright.alkashafqatar.com";
const BRIGHT_CODE_REGEX = /\bP\d{6}\b/gi;

function brightGetBaseUrl(callback) {
  chrome.storage.sync.get(["baseUrl"], (result) => {
    callback(result.baseUrl || BRIGHT_DEFAULT_BASE_URL);
  });
}

function brightBuildGoUrl(baseUrl, code) {
  const trimmed = (baseUrl || BRIGHT_DEFAULT_BASE_URL).replace(/\/+$/, "");
  return `${trimmed}/go?code=${encodeURIComponent(code.trim())}`;
}

function brightExtractCode(text) {
  if (!text) return null;
  const match = text.match(BRIGHT_CODE_REGEX);
  return match ? match[0].toUpperCase() : null;
}

if (typeof window !== "undefined") {
  window.BrightShared = {
    DEFAULT_BASE_URL: BRIGHT_DEFAULT_BASE_URL,
    CODE_REGEX: BRIGHT_CODE_REGEX,
    getBaseUrl: brightGetBaseUrl,
    buildGoUrl: brightBuildGoUrl,
    extractCode: brightExtractCode,
  };
}
