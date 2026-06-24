(() => {
  const OVERLAY_ID = "yt-focus-search-overlay";
  const DEFAULT_ENABLED = true;
  const RECOMMENDATION_SELECTORS = [
    "ytd-watch-next-secondary-results-renderer",
    "ytd-watch-flexy #secondary",
    "ytd-rich-grid-renderer",
    "ytd-rich-section-renderer",
    "ytd-reel-shelf-renderer",
    "ytd-horizontal-card-list-renderer",
    "ytd-shelf-renderer[is-shorts]",
    "ytd-video-renderer[is-shorts]",
    "ytd-compact-video-renderer",
    "ytd-compact-radio-renderer",
    "ytd-compact-playlist-renderer",
    "ytd-item-section-renderer[section-identifier='related-items']",
    "ytd-merch-shelf-renderer",
    "ytd-endscreen",
    ".ytp-endscreen-content",
    ".ytp-ce-element"
  ];
  const SEARCH_RECOMMENDATION_SELECTORS = [
    "ytd-reel-shelf-renderer",
    "ytd-reel-item-renderer",
    "ytd-reel-video-renderer",
    "ytd-rich-section-renderer",
    "ytd-shelf-renderer[is-shorts]",
    "ytd-shelf-renderer:has(a[href*='/shorts/'])",
    "ytd-video-renderer[is-shorts]",
    "ytd-video-renderer:has(a[href*='/shorts/'])",
    "ytd-item-section-renderer:has(ytd-reel-shelf-renderer)",
    "yt-horizontal-list-renderer:has(a[href*='/shorts/'])",
    "yt-lockup-view-model:has(a[href*='/shorts/'])"
  ];

  let lastUrl = "";
  let pendingApply = 0;
  let isEnabled = DEFAULT_ENABLED;

  const isHomePath = () => {
    const path = window.location.pathname;
    return path === "/" || path === "";
  };

  const isSearchPath = () => window.location.pathname === "/results";

  const applyMode = () => {
    pendingApply = 0;
    if (!isEnabled) {
      cleanupMode();
      return;
    }

    const root = document.documentElement;
    const shouldShowHome = isHomePath();

    root.classList.toggle("ytfs-focus-home", shouldShowHome);
    root.classList.add("ytfs-recommendations-hidden");

    if (shouldShowHome) {
      ensureOverlay();
    } else {
      removeOverlay();
    }

    hideRecommendations();
  };

  const scheduleApply = () => {
    if (pendingApply) {
      return;
    }

    pendingApply = window.setTimeout(applyMode, 50);
  };

  const hideRecommendations = () => {
    if (isSearchPath()) {
      hideSearchRecommendationsOnly();
      return;
    }

    for (const selector of RECOMMENDATION_SELECTORS) {
      document.querySelectorAll(selector).forEach(hideNode);
    }
  };

  const hideSearchRecommendationsOnly = () => {
    for (const selector of SEARCH_RECOMMENDATION_SELECTORS) {
      document.querySelectorAll(selector).forEach(hideNode);
    }

    hideSearchShortsShelves();
  };

  const hideSearchShortsShelves = () => {
    const shortsLinks = document.querySelectorAll('a[href*="/shorts/"]');

    shortsLinks.forEach((link) => {
      const shelf = findShortsShelf(link);

      if (shelf) {
        hideNode(shelf);
      }
    });

    document.querySelectorAll("h2, h3").forEach((heading) => {
      if (!isShortsLabel(heading.textContent)) {
        return;
      }

      const shelf = findShortsShelf(heading);

      if (shelf) {
        hideNode(shelf);
      }
    });
  };

  const findShortsShelf = (sourceNode) => {
    let node = sourceNode.parentElement;

    while (node && node !== document.body) {
      const shortsLinkCount = node.querySelectorAll?.('a[href*="/shorts/"]').length ?? 0;
      const text = node.textContent ?? "";
      const looksLikeShortsShelf =
        shortsLinkCount >= 2 &&
        isShortsLabel(text);

      if (looksLikeShortsShelf && isReasonableShelfSize(node)) {
        return node;
      }

      node = node.parentElement;
    }

    return sourceNode.closest(
      [
        "ytd-reel-item-renderer",
        "ytd-reel-video-renderer",
        "ytd-video-renderer",
        "ytd-rich-item-renderer",
        "yt-lockup-view-model"
      ].join(", ")
    );
  };

  const isShortsLabel = (text) => {
    const normalizedText = (text ?? "").trim().toLowerCase();
    return normalizedText.includes("ショート") || normalizedText.includes("shorts");
  };

  const isReasonableShelfSize = (node) => {
    const rect = node.getBoundingClientRect();
    return rect.width >= 240 && rect.height >= 80 && rect.height <= Math.max(900, window.innerHeight * 1.4);
  };

  const hideNode = (node) => {
    node.dataset.ytfsHidden = "true";

    if (!node.hasAttribute("hidden")) {
      node.dataset.ytfsAddedHidden = "true";
      node.setAttribute("hidden", "true");
    }

    if (node.getAttribute("aria-hidden") !== "true") {
      node.dataset.ytfsAddedAriaHidden = "true";
      node.setAttribute("aria-hidden", "true");
    }
  };

  const restoreHiddenNodes = () => {
    document.querySelectorAll("[data-ytfs-hidden='true']").forEach((node) => {
      if (node.dataset.ytfsAddedHidden === "true") {
        node.removeAttribute("hidden");
      }

      if (node.dataset.ytfsAddedAriaHidden === "true") {
        node.removeAttribute("aria-hidden");
      }

      delete node.dataset.ytfsHidden;
      delete node.dataset.ytfsAddedHidden;
      delete node.dataset.ytfsAddedAriaHidden;
    });
  };

  const cleanupMode = () => {
    document.documentElement.classList.remove("ytfs-focus-home", "ytfs-recommendations-hidden");
    removeOverlay();
    restoreHiddenNodes();
  };

  const ensureOverlay = () => {
    if (document.getElementById(OVERLAY_ID)) {
      return;
    }

    const host = document.createElement("div");
    host.id = OVERLAY_ID;
    const shadow = host.attachShadow({ mode: "open" });
    shadow.appendChild(buildOverlay());
    document.documentElement.appendChild(host);

    const input = shadow.querySelector("input");
    window.setTimeout(() => input?.focus(), 120);
  };

  const removeOverlay = () => {
    document.getElementById(OVERLAY_ID)?.remove();
  };

  const buildOverlay = () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <style>
        :host {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          color-scheme: light dark;
          --ytfs-background: #ffffff;
          --ytfs-surface: #ffffff;
          --ytfs-surface-subtle: #f8f8f8;
          --ytfs-text: #0f0f0f;
          --ytfs-muted: #606060;
          --ytfs-border: #d9d9d9;
          --ytfs-border-strong: #c6c6c6;
          --ytfs-button: #f8f8f8;
          --ytfs-button-hover: #f0f0f0;
          font-family: Roboto, Arial, sans-serif;
        }

        .screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          box-sizing: border-box;
          background: var(--ytfs-background);
        }

        .panel {
          width: min(860px, 100%);
          display: grid;
          gap: 30px;
          justify-items: center;
          transform: translateY(-6vh);
        }

        .identity {
          display: grid;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 0;
          color: var(--ytfs-text);
          text-align: center;
        }

        .product {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--ytfs-text);
          margin: 0;
          font-size: 38px;
          line-height: 1;
          font-weight: 650;
          letter-spacing: 0;
        }

        .mode {
          margin: 0;
          color: var(--ytfs-muted);
          font-size: 15px;
          line-height: 1.35;
          font-weight: 400;
          letter-spacing: 0;
        }

        form {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0;
          min-height: 58px;
          padding: 0;
          border: 1px solid var(--ytfs-border);
          border-radius: 29px;
          background: var(--ytfs-surface);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 28px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
          overflow: hidden;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }

        form:focus-within {
          border-color: #1c62b9;
          box-shadow: 0 0 0 1px #1c62b9;
        }

        .search-icon {
          flex: 0 0 auto;
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          color: var(--ytfs-muted);
        }

        .search-icon svg {
          display: block;
          width: 20px;
          height: 20px;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        input {
          min-width: 0;
          flex: 1;
          height: 58px;
          border: 0;
          outline: 0;
          padding: 0 18px 0 0;
          border-radius: 0;
          background: transparent;
          color: var(--ytfs-text);
          font: inherit;
          font-size: 20px;
          line-height: 1.2;
          font-weight: 400;
        }

        input::placeholder {
          color: #909090;
          opacity: 1;
        }

        button {
          flex: 0 0 auto;
          height: 58px;
          width: 86px;
          display: grid;
          place-items: center;
          border: 0;
          border-left: 1px solid var(--ytfs-border);
          border-radius: 0;
          background: var(--ytfs-button);
          color: #0f0f0f;
          cursor: pointer;
          transition: background 120ms ease;
        }

        button:hover {
          background: var(--ytfs-button-hover);
        }

        button:active {
          background: #e9e9e9;
        }

        button:focus-visible {
          outline: 2px solid #1c62b9;
          outline-offset: -3px;
        }

        button svg {
          width: 22px;
          height: 22px;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (prefers-color-scheme: dark) {
          :host {
            --ytfs-background: #0f0f0f;
            --ytfs-surface: #121212;
            --ytfs-surface-subtle: #181818;
            --ytfs-text: #f1f1f1;
            --ytfs-muted: #aaa;
            --ytfs-border: #303030;
            --ytfs-border-strong: #303030;
            --ytfs-button: #222222;
            --ytfs-button-hover: #303030;
          }

          .screen {
            background: var(--ytfs-background);
          }

          .identity {
            color: var(--ytfs-text);
          }

          .mode {
            color: var(--ytfs-muted);
          }

          form {
            border-color: var(--ytfs-border-strong);
            background: var(--ytfs-surface);
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
          }

          form:focus-within {
            border-color: #3ea6ff;
            box-shadow: 0 0 0 1px #3ea6ff;
          }

          .search-icon {
            color: var(--ytfs-muted);
          }

          input {
            color: var(--ytfs-text);
          }

          input::placeholder {
            color: #888;
          }

          button {
            background: var(--ytfs-button);
            color: var(--ytfs-text);
          }

          button:hover {
            background: var(--ytfs-button-hover);
          }

          button:focus-visible {
            outline-color: #3ea6ff;
          }
        }

        @media (max-width: 520px) {
          .screen {
            padding: 24px 18px;
          }

          .panel {
            gap: 22px;
            transform: translateY(-3vh);
          }

          .identity {
            flex-direction: column;
            gap: 10px;
          }

          form {
            min-height: 46px;
            border-radius: 23px;
          }

          input {
            height: 46px;
            padding-left: 0;
            font-size: 16px;
          }

          button {
            width: 58px;
            height: 46px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          form,
          button {
            transition: none;
          }
        }
      </style>
      <main class="screen" aria-label="Focused search">
        <section class="panel">
          <header class="identity">
            <h1 class="product">
              Focus Search
            </h1>
            <p class="mode">Search youtube.com</p>
          </header>
          <form>
            <span class="search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7"></circle>
                <path d="m20 20-4.4-4.4"></path>
              </svg>
            </span>
            <input type="search" autocomplete="off" spellcheck="false" placeholder="Search" aria-label="Search" />
            <button type="submit" aria-label="Search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14"></path>
                <path d="m13 6 6 6-6 6"></path>
              </svg>
            </button>
          </form>
        </section>
      </main>
    `;

    wrapper.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = wrapper.querySelector("input");
      const query = input.value.trim();

      if (!query) {
        input.focus();
        return;
      }

      document.documentElement.classList.remove("ytfs-focus-home");
      removeOverlay();
      window.location.assign(`/results?search_query=${encodeURIComponent(query)}`);
    });

    return wrapper;
  };

  const patchHistory = () => {
    for (const methodName of ["pushState", "replaceState"]) {
      const original = history[methodName];
      if (original.__ytfsPatched) {
        continue;
      }

      const patched = function patchedHistoryMethod(...args) {
        const result = original.apply(this, args);
        window.dispatchEvent(new Event("ytfs-locationchange"));
        return result;
      };

      patched.__ytfsPatched = true;
      history[methodName] = patched;
    }
  };

  const observeUrl = () => {
    const currentUrl = window.location.href;
    if (currentUrl === lastUrl) {
      return;
    }

    lastUrl = currentUrl;
    scheduleApply();
  };

  const loadEnabledState = () => {
    chrome.storage.local.get({ enabled: DEFAULT_ENABLED }, (result) => {
      isEnabled = result.enabled !== false;
      scheduleApply();
    });
  };

  const watchEnabledState = () => {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes.enabled) {
        return;
      }

      isEnabled = changes.enabled.newValue !== false;
      scheduleApply();
    });
  };

  const start = () => {
    patchHistory();
    watchEnabledState();
    window.addEventListener("ytfs-locationchange", observeUrl);
    window.addEventListener("popstate", observeUrl);
    window.addEventListener("yt-navigate-finish", scheduleApply);

    new MutationObserver(scheduleApply).observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    loadEnabledState();
    observeUrl();
  };

  start();
})();
