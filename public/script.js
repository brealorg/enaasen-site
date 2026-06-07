(() => {
  "use strict";

  const SITE_LAUNCHED_AT = new Date("2026-05-25T00:00:00+02:00");

  const deployInfo =
    window.deployInfo ||
    window.__DEPLOY_INFO__ ||
    window.__BUILD_META__ ||
    {};

  const setField = (name, value) => {
    document.querySelectorAll(`[data-field="${name}"]`).forEach((element) => {
      element.textContent = value;
    });
  };

  const formatDuration = (fromDate, toDate = new Date()) => {
    const date = fromDate instanceof Date ? fromDate : new Date(fromDate);

    if (Number.isNaN(date.getTime())) {
      return "unknown";
    }

    let seconds = Math.max(0, Math.floor((toDate - date) / 1000));

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;

    return "now";
  };

  const getCommitTime = () => {
    const value =
      deployInfo.commitTime ||
      deployInfo.updated ||
      deployInfo.buildTime ||
      deployInfo.time ||
      null;

    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getCommitHash = () => {
    return (
      deployInfo.commit ||
      deployInfo.sha ||
      deployInfo.hash ||
      "local"
    );
  };

  const updateStatus = () => {
    const commitTime = getCommitTime();

    setField("siteAge", formatDuration(SITE_LAUNCHED_AT));
    setField("updatedAgo", commitTime ? `${formatDuration(commitTime)} ago` : "unknown");
    setField("commit", getCommitHash());
  };

  const parseCloudflareTrace = (text) => {
    return Object.fromEntries(
      text
        .trim()
        .split("\n")
        .map((line) => line.split("="))
        .filter((parts) => parts.length === 2)
    );
  };

  const detectBrowser = () => {
    const ua = navigator.userAgent;

    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
    if (ua.includes("Chrome/") && !ua.includes("Chromium/")) return "Chrome";
    if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";

    return "unknown";
  };

  const detectOs = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform || "";

    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    if (ua.includes("Mac OS X") || platform.includes("Mac")) return "macOS";
    if (ua.includes("Linux") || platform.includes("Linux")) return "Linux";

    return "unknown";
  };

  const updateClientFields = () => {
    setField("browser", detectBrowser());
    setField("os", detectOs());
    setField("language", navigator.language || "unknown");

    try {
      setField("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown");
    } catch {
      setField("timezone", "unknown");
    }

    setField("screen", `${window.screen.width}x${window.screen.height}`);
    setField("ua", navigator.userAgent || "unknown");
  };

  const updateCloudflareFields = async () => {
    try {
      const response = await fetch("/cdn-cgi/trace", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`trace failed: ${response.status}`);
      }

      const trace = parseCloudflareTrace(await response.text());

      setField("ip", trace.ip || "unknown");
      setField("country", trace.loc || "unknown");
      setField("colo", trace.colo || "unknown");
      setField("http", trace.http || "unknown");
      setField("tls", trace.tls || "unknown");
      setField("warp", trace.warp || "unknown");
    } catch {
      setField("ip", "unavailable");
      setField("country", "unavailable");
      setField("colo", "unavailable");
      setField("http", "unavailable");
      setField("tls", "unavailable");
      setField("warp", "unavailable");
    }
  };

  const init = () => {
    updateStatus();
    updateClientFields();
    updateCloudflareFields();

    window.setInterval(updateStatus, 60000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
