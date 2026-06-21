// Injected on each toolbar click. Runs in the extension's isolated world,
// which persists across injections for the same frame, so we keep toggle
// state on `window.__patreonTheater`. The DOM we touch is the shared page DOM.
(() => {
  const NS = "__patreonTheater";
  const Z = "2147483646";

  const log = (...a) =>
    console.log("%c[PatreonTheater]", "color:#ff424d;font-weight:bold", ...a);

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
    const { video, anchor, overlay, prevVideoStyle, onKey, prevOverflow } = state;
    try {
      // Put the video back exactly where it was, if its home still exists.
      if (anchor && anchor.isConnected) {
        anchor.parentNode.insertBefore(video, anchor);
        anchor.remove();
      }
      if (video) video.setAttribute("style", prevVideoStyle || "");
      if (overlay) overlay.remove();
      document.documentElement.style.overflow = prevOverflow || "";
      window.removeEventListener("keydown", onKey, true);
    } catch (e) {
      log("exit cleanup error (continuing):", e);
    }
    window[NS] = { active: false };
    log("theater OFF");
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
  });

  // Remember the video's home so we can restore it perfectly on exit.
  const anchor = document.createComment("patreon-theater-anchor");
  video.parentNode.insertBefore(anchor, video);
  const prevVideoStyle = video.getAttribute("style") || "";
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

  // Esc exits. Click on the black backdrop (not the video) exits too.
  const onKey = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      toggleOff();
    }
  };
  window.addEventListener("keydown", onKey, true);
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) toggleOff();
  });

  // Local exit used by Esc/backdrop so we don't rely on re-injection.
  function toggleOff() {
    try {
      if (anchor && anchor.isConnected) {
        anchor.parentNode.insertBefore(video, anchor);
        anchor.remove();
      }
      video.setAttribute("style", prevVideoStyle);
      overlay.remove();
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey, true);
    } catch (e) {
      log("exit cleanup error (continuing):", e);
    }
    window[NS] = { active: false };
    log("theater OFF");
  }

  window[NS] = {
    active: true,
    video,
    anchor,
    overlay,
    prevVideoStyle,
    prevOverflow,
    onKey,
  };
  log("theater ON — Esc, backdrop click, or toolbar icon to exit.");
})();
