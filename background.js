// MV3 service worker. Clicking the toolbar icon injects theater.js into the
// active tab's top frame. activeTab is granted by the click, so we need no
// broad host permissions. theater.js is self-toggling: each run enters or
// exits theater based on the page's current state.
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["theater.js"],
    });
  } catch (e) {
    // Most common cause: clicked on a restricted page (chrome://, web store,
    // PDF viewer) where scripts can't be injected. Nothing we can do there.
    console.warn("[PatreonTheater] injection failed:", e.message);
  }
});
