# Patreon Theater Mode

A tiny Chrome (MV3) extension that gives Patreon's video player a fit-to-viewport
"theater" view, since the native player has no theater/soft-fullscreen mode.

Click the toolbar icon to toggle. The largest visible `<video>` on the page is
reparented into a full-viewport black overlay with `object-fit: contain`, so the
whole frame is visible and scales to fill whichever axis (width or height) binds
first, with aspect ratio preserved.

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
- `theater.js` — self-toggling. Runs in the extension's isolated world (which
  persists across injections), keeping toggle state on `window.__patreonTheater`.
  On exit it restores the video to its exact original DOM position and styles.

## Known constraints

- Relies on the player living in the **top document** (verified for the current
  Patreon player). If Patreon moves the player into a cross-origin iframe, this
  approach stops working and would need `all_frames` injection + a different
  strategy.
- Native video controls are shown in theater mode because Patreon's custom
  control bar is detached during reparenting.

## Possible next steps

- Add icons (currently uses Chrome's default action icon).
- Restrict injection to `patreon.com` if you don't want it usable elsewhere.
- Re-dock Patreon's own controls instead of using native controls.
