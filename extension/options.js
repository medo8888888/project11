const input = document.getElementById("baseUrl");
const status = document.getElementById("status");

window.BrightShared.getBaseUrl((baseUrl) => {
  input.value = baseUrl;
});

document.getElementById("save").addEventListener("click", () => {
  let value = input.value.trim() || window.BrightShared.DEFAULT_BASE_URL;
  value = value.replace(/\/+$/, "");
  chrome.storage.sync.set({ baseUrl: value }, () => {
    status.textContent = "Saved";
    setTimeout(() => (status.textContent = ""), 1500);
  });
});
