(() => {
  const setField = (name, value) => {
    const element = document.querySelector(`[data-field="${name}"]`);
    if (!element) return;

    element.textContent = value || "unknown";
    element.classList.remove("pending");
  };

  const parseTrace = (text) => {
    const result = {};

    text
      .trim()
      .split("\n")
      .forEach((line) => {
        const index = line.indexOf("=");
        if (index === -1) return;

        const key = line.slice(0, index);
        const value = line.slice(index + 1);

        result[key] = value;
      });

    return result;
  };

  const detectBrowser = (ua) => {
    if (/Edg\//.test(ua)) return "Microsoft Edge";
    if (/OPR\//.test(ua)) return "Opera";
    if (/Firefox\//.test(ua)) return "Firefox";
    if (/Chrome\//.test(ua) && !/Chromium\//.test(ua)) return "Chrome";
    if (/Chromium\//.test(ua)) return "Chromium";
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
    return "unknown";
  };

  const detectOs = (ua) => {
    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iOS / iPadOS";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
    if (/Linux/i.test(ua)) return "Linux";
    return "unknown";
  };

  const localUa = navigator.userAgent || "unknown";

  setField("browser", detectBrowser(localUa));
  setField("os", detectOs(localUa));
  setField("language", navigator.language || "unknown");
  setField("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown");
  setField(
    "screen",
    `${window.screen.width}x${window.screen.height} @ ${window.devicePixelRatio || 1}x`
  );
  setField("ua", localUa);

  fetch("/cdn-cgi/trace", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Cloudflare trace unavailable");
      }

      return response.text();
    })
    .then((text) => {
      const trace = parseTrace(text);

      setField("ip", trace.ip);
      setField("country", trace.loc);
      setField("colo", trace.colo);
      setField("http", trace.http);
      setField("tls", trace.tls);
      setField("warp", trace.warp);

      if (trace.uag) {
        setField("browser", detectBrowser(trace.uag));
        setField("os", detectOs(trace.uag));
        setField("ua", trace.uag);
      }
    })
    .catch(() => {
      setField("ip", "unavailable outside Cloudflare");
      setField("country", "unknown");
      setField("colo", "unknown");
      setField("http", "unknown");
      setField("tls", "unknown");
      setField("warp", "unknown");
    });
})();
