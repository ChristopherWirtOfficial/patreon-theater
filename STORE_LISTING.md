# Chrome Web Store listing — copy & answers

Paste-ready content for the Developer Dashboard submission. Update the URLs if
the repo moves.

## Product details

**Name**
Theater Mode for Patreon

**Summary** (max 132 chars)
Fit-to-viewport theater mode for the Patreon video player. Not affiliated with Patreon.

**Category**
Functionality & UI (alt: Accessibility)

**Detailed description**
Patreon's video player has no theater or soft-fullscreen mode. This adds one.

Click the toolbar icon on any Patreon post with a video and the player expands
to fill your browser window — the whole frame stays visible and keeps its
aspect ratio, scaling to whichever edge (width or height) it reaches first.
No more squinting at a small embedded player.

Features:
• One-click toggle from the toolbar icon
• Fills the viewport while preserving aspect ratio (nothing cropped)
• Exit with the icon, the Esc key, or a click on the backdrop
• Cursor and controls auto-hide while watching, like a normal video player
• Only active on patreon.com; greyed out everywhere else
• No accounts, no tracking, no data collection, no network calls

Not affiliated with, endorsed by, or sponsored by Patreon. "Patreon" is a
trademark of its respective owner; it is used here only to describe what the
extension works with.

## Single purpose (required field)

Adds a fit-to-viewport "theater" viewing mode to the Patreon web video player.

## Permission justifications (required for review)

- **activeTab** — Lets the extension act on the current Patreon tab only when
  you click the toolbar icon. No standing access to any site.
- **scripting** — Injects the toggle script into the active tab on click to
  reposition the video element into a full-viewport overlay (and to restore it
  on exit).
- **declarativeContent** — Enables the toolbar button only on patreon.com so
  the action is inert (greyed out) on all other sites. Used purely for URL
  matching; it does not read page content.

No host permissions are requested. Nothing runs until you click the icon.

## Data usage disclosure (Privacy practices tab)

- Does the extension collect or use user data? **No.**
- Sold to third parties? **No.**
- Used/transferred for purposes unrelated to core functionality? **No.**
- Used/transferred to determine creditworthiness / lending? **No.**
- Privacy policy URL: https://github.com/ChristopherWirtOfficial/patreon-theater/blob/main/PRIVACY.md

## Assets you still need to create

- **Store icon**: 128×128 PNG — `icons/icon128.png` (already in repo).
- **Screenshots**: at least one, 1280×800 or 640×400 PNG/JPEG. Capture the
  player before/after toggling theater mode on a Patreon post.
- **Small promo tile** (optional but recommended): 440×280 PNG.
- **Marquee promo** (optional): 1400×560 PNG.
