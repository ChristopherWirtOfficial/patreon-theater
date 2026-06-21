// MV3 service worker. Clicking the toolbar icon injects theater.js into the
// active tab's top frame. activeTab is granted by the click, so we need no
// broad host permissions. theater.js is self-toggling: each run enters or
// exits theater based on the page's current state.
// The toolbar icon can't be removed from the pinned area per-site (pinning is
// user-controlled), but we can disable it everywhere by default and enable it
// only on patreon.com. Off Patreon the icon is greyed out and unclickable; on
// Patreon it's full-colour and live.
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: "patreon.com" },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      },
    ]);
  });
});

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

// theater.js reports its on/off state (including when the user exits via Esc or
// backdrop click). Reflect it on the toolbar icon so the state is visible.
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg || msg.type !== "pt-state" || !sender.tab) return;
  const tabId = sender.tab.id;
  chrome.action.setBadgeText({ tabId, text: msg.active ? "ON" : "" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#ff424d" });
  chrome.action.setTitle({
    tabId,
    title: msg.active
      ? "Patreon Theater Mode: ON (click or Esc to exit)"
      : "Toggle Patreon Theater Mode",
  });
});
