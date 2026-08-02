/* Loads the JSON content files (edited via the CMS). Memoized so each file
   is fetched once even if several scripts need it.

   A per-load timestamp is appended to the URL so the browser never serves a
   stale copy — the content files change on every CMS edit, and GitHub Pages
   otherwise caches them for ~10 minutes. The files are tiny, so skipping the
   cache costs nothing and means edits show up as soon as the deploy finishes. */
window.CACHE_BUST = function (url) {
  return url + (url.indexOf("?") === -1 ? "?" : "&") + "t=" + Date.now();
};

window.DATA = {
  _s: null,
  _p: null,
  loadSite: function () {
    return this._s || (this._s = fetch(window.CACHE_BUST("data/site.json"), { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("site.json " + r.status);
      return r.json();
    }));
  },
  loadPublications: function () {
    return this._p || (this._p = fetch(window.CACHE_BUST("data/publications.json"), { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("publications.json " + r.status);
      return r.json();
    }));
  },
};

/* Normalize an asset path so it works whether the CMS stored it with or
   without a leading slash (important for GitHub Pages project sites served
   under /repo-name/). */
window.assetUrl = function (p) {
  if (!p) return "";
  return String(p).replace(/^\/+/, "");
};
