(function injectPageScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = () => script.remove();      // clean up after loading
  (document.head || document.documentElement).appendChild(script);
})();