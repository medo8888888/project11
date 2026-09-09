const form = document.getElementById("form");
const input = document.getElementById("code");
const optionsLink = document.getElementById("options-link");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = input.value.trim();
  if (!raw) return;
  window.BrightShared.getBaseUrl((baseUrl) => {
    chrome.tabs.create({ url: window.BrightShared.buildGoUrl(baseUrl, raw) });
    window.close();
  });
});

optionsLink.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
