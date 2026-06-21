# Theater Mode for Patreon

A tiny Chrome (MV3) extension that gives Patreon's video player a fit-to-viewport
"theater" view, since the native player has no theater/soft-fullscreen mode.

> Not affiliated with, endorsed by, or sponsored by Patreon. "Patreon" is used
> only to describe what this extension works with.

Click the toolbar icon to toggle. The largest visible `<video>` on the page is
reparented into a full-viewport black overlay with `object-fit: contain`, so the
whole frame is visible and scales to fill whichever axis (width or height) binds
first, with aspect ratio preserved.

When theater is on, the toolbar icon shows an **ON** badge, a brief "Press Esc
to exit" hint fades in, and the cursor + native controls auto-hide after a few
seconds of no mouse movement (like a normal video player).

## Exit

- Click the toolbar icon again
- Press **Esc**
- Click the black area outside the video

## Install (unpacked, for development)

1. Go to `chrome://extensions`
2. Toggle **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`patreon-theater`)
5. Pin the extension so the icon is visible, then click it on a Patreon post
   with the video playing.

## How it works

- `background.js` — service worker. On toolbar click, injects `theater.js` into
  the active tab. Uses `activeTab` + `scripting`, so no broad host permissions.
  Listens for `pt-state` messages from the page to keep the toolbar badge/title
  in sync (so the badge clears even when you exit via Esc or backdrop click).
- `theater.js` — self-toggling. Runs in the extension's isolated world (which
  persists across injections), keeping toggle state on `window.__patreonTheater`.
  On exit it restores the video to its exact original DOM position, styles, and
  `controls` state.
- `icons/` — coral "fit-to-frame" action icons (16/32/48/128).

## Known constraints

- Relies on the player living in the **top document** (verified for the current
  Patreon player). If Patreon moves the player into a cross-origin iframe, this
  approach stops working and would need `all_frames` injection + a different
  strategy.
- Native video controls are shown in theater mode because Patreon's custom
  control bar is detached during reparenting.

## Site gating

The action is disabled everywhere by default and enabled only on `patreon.com`
via `declarativeContent`. Off Patreon the pinned icon is greyed out and does
nothing; on Patreon it's full-colour and clickable. Chrome does not let an
extension hide/unpin its own toolbar icon per-site — greying out is the closest
available behaviour.

## Packaging for the Chrome Web Store

Run the packager to build an upload-ready zip of just the runtime files
(manifest, scripts, icons — no docs/license/git):

```powershell
powershell -ExecutionPolicy Bypass -File .\package.ps1
```

It writes `dist/theater-mode-for-patreon-<version>.zip`. Upload that in the
[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
Listing copy, permission justifications, and the data-use answers are in
[`STORE_LISTING.md`](STORE_LISTING.md); the privacy policy is in
[`PRIVACY.md`](PRIVACY.md).

## Possible next steps

- Re-dock Patreon's own controls instead of using native controls.
