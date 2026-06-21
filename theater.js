// Injected on each toolbar click. Runs in the extension's isolated world,
// which persists across injections for the same frame, so we keep toggle
// state on `window.__patreonTheater`. The DOM we touch is the shared page DOM.
(() => {
  const NS = "__patreonTheater";
  const Z = "2147483646";
  const IDLE_MS = 2500;

  const log = (...a) =>
    console.log("%c[PatreonTheater]", "color:#ff424d;font-weight:bold", ...a);

  // Report on/off state to the service worker so the toolbar badge/title stay
  // accurate even when the user exits via Esc or backdrop click.
  const setBadge = (active) => {
    try {
      chrome.runtime.sendMessage({ type: "pt-state", active });
    } catch (e) {
      /* runtime may be gone after navigation; ignore */
    }
  };

  // --- find the largest visible <video> in this document ---
  const findVideo = () => {
    const vids = [...document.querySelectorAll("video")].filter((v) => {
      const r = v.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && v.offsetParent !== null;
    });
    if (!vids.length) return null;
    return vids.sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return rb.width * rb.height - ra.width * ra.height;
    })[0];
  };

  const state = window[NS];

  // ----------------------------- EXIT -----------------------------
  if (state && state.active) {
    state.teardown();
    return;
  }

  // ----------------------------- ENTER ----------------------------
  const video = findVideo();
  if (!video) {
    log("no visible <video> found — start playback first, then click again.");
    return;
  }

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "#000",
    zIndex: Z,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0",
    cursor: "default",
  });

  // Remember the video's home so we can restore it perfectly on exit.
  const anchor = document.createComment("patreon-theater-anchor");
  video.parentNode.insertBefore(anchor, video);
  const prevVideoStyle = video.getAttribute("style") || "";
  const prevControls = video.controls;
  const prevOverflow = document.documentElement.style.overflow || "";
  const wasPlaying = !video.paused;

  document.body.appendChild(overlay);
  overlay.appendChild(video);
  Object.assign(video.style, {
    width: "100vw",
    height: "100vh",
    objectFit: "contain", // entire frame visible, aspect ratio preserved
    background: "#000",
    maxWidth: "100vw",
    maxHeight: "100vh",
  });
  video.controls = true; // Patreon's own controls are detached; use native
  document.documentElement.style.overflow = "hidden";

  // Reparenting shouldn't stop playback, but resync just in case.
  if (wasPlaying && video.paused) {
    video.play().catch((e) => log("resume play() blocked:", e.message));
  }

  // --- auto-fading "Esc to exit" hint ---
  const hint = document.createElement("div");
  hint.textContent = "Press Esc to exit";
  Object.assign(hint.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "8px 16px",
    background: "rgba(0,0,0,0.65)",
    color: "#fff",
    font: "500 13px system-ui, sans-serif",
    borderRadius: "999px",
    zIndex: String(Number(Z) + 1),
    pointerEvents: "none",
    transition: "opacity .5s ease",
    opacity: "1",
  });
  overlay.appendChild(hint);
  const hintHide = setTimeout(() => (hint.style.opacity = "0"), 2200);

  // --- player-style idle hiding of cursor + native controls ---
  let idleTimer = null;
  const goIdle = () => {
    overlay.style.cursor = "none";
    video.controls = false;
  };
  const wake = () => {
    overlay.style.cursor = "default";
    video.controls = true;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_MS);
  };
  overlay.addEventListener("mousemove", wake);
  idleTimer = setTimeout(goIdle, IDLE_MS);

  // Esc exits. Click on the black backdrop (not the video) exits too.
  const onKey = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      teardown();
    }
  };
  window.addEventListener("keydown", onKey, true);
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) teardown();
  });

  // Single teardown path, used by re-injection, Esc, and backdrop click.
  function teardown() {
    try {
      if (idleTimer) clearTimeout(idleTimer);
      clearTimeout(hintHide);
      if (anchor && anchor.isConnected) {
        anchor.parentNode.insertBefore(video, anchor);
        anchor.remove();
      }
      video.controls = prevControls;
      video.setAttribute("style", prevVideoStyle);
      overlay.remove();
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey, true);
    } catch (e) {
      log("exit cleanup error (continuing):", e);
    }
    window[NS] = { active: false };
    setBadge(false);
    log("theater OFF");
  }

  window[NS] = { active: true, teardown };
  setBadge(true);
  log("theater ON — Esc, backdrop click, or toolbar icon to exit.");
})();
