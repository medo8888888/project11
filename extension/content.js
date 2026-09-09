// Best-effort auto-linker: turns plain-text project codes (P000042) inside
// Gmail/Outlook web message bodies into clickable links to /go?code=...
// Runs defensively — webmail DOMs are complex and change often, so any
// failure here should never break the host page.
(function () {
  "use strict";

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "A"]);
  const LINK_CLASS = "bright-code-link";
  let scheduled = false;

  function isEditable(node) {
    let el = node.nodeType === 3 ? node.parentElement : node;
    while (el) {
      if (el.isContentEditable) return true;
      el = el.parentElement;
    }
    return false;
  }

  function shouldSkip(el) {
    if (!el) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.classList && el.classList.contains(LINK_CLASS)) return true;
    return false;
  }

  function linkifyTextNode(textNode, baseUrl) {
    const text = textNode.nodeValue;
    if (!text || !window.BrightShared.CODE_REGEX.test(text)) return;
    window.BrightShared.CODE_REGEX.lastIndex = 0;

    const parent = textNode.parentNode;
    if (!parent || shouldSkip(parent) || isEditable(textNode)) return;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    const re = new RegExp(window.BrightShared.CODE_REGEX);
    while ((match = re.exec(text)) !== null) {
      const code = match[0].toUpperCase();
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      const a = document.createElement("a");
      a.href = window.BrightShared.buildGoUrl(baseUrl, code);
      a.textContent = match[0];
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = LINK_CLASS;
      a.style.color = "#4f46e5";
      a.style.textDecoration = "underline";
      a.title = `Open ${code} in Bright`;
      frag.appendChild(a);
      lastIndex = match.index + match[0].length;
    }
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    parent.replaceChild(frag, textNode);
  }

  function walk(root, baseUrl) {
    try {
      if (shouldSkip(root) || isEditable(root)) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (shouldSkip(node.parentElement) || isEditable(node)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach((node) => linkifyTextNode(node, baseUrl));
    } catch {
      // Webmail DOM is out of our control — never let a scan crash the page.
    }
  }

  function scan() {
    if (scheduled) return;
    scheduled = true;
    requestIdleCallback(
      () => {
        scheduled = false;
        window.BrightShared.getBaseUrl((baseUrl) => walk(document.body, baseUrl));
      },
      { timeout: 2000 }
    );
  }

  if (typeof requestIdleCallback === "undefined") {
    window.requestIdleCallback = (cb) => setTimeout(cb, 200);
  }

  scan();
  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
})();
