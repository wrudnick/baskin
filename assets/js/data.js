/* Loads the JSON content files (edited via the CMS). Memoized so each file
   is fetched once even if several scripts need it. */
window.DATA = {
  _s: null,
  _p: null,
  loadSite: function () {
    return this._s || (this._s = fetch("data/site.json").then(function (r) {
      if (!r.ok) throw new Error("site.json " + r.status);
      return r.json();
    }));
  },
  loadPublications: function () {
    return this._p || (this._p = fetch("data/publications.json").then(function (r) {
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
