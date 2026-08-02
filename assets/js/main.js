/* Renders masthead, home, publications, and about from the JSON data files. */
(function () {
  "use strict";

  // Legacy heading map (only used to render old flat `items` data, if present).
  var PUB_ORDER = ["Journal article", "Conference paper", "Preprint / working paper"];
  var PUB_HEADING = {
    "Journal article": "Journal articles",
    "Conference paper": "Conference papers",
    "Preprint / working paper": "Preprints & working papers",
  };
  // Fixed nav (labels + targets). Kept in code since it rarely changes.
  var NAV = [
    { label: "selected publications", href: "publications.html" },
    { label: "cv", href: "cv.html" },
    { label: "about + contact", href: "about.html" },
  ];

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }

  /* ---- Masthead + nav -------------------------------------------------- */
  function renderMasthead(site) {
    var mount = document.querySelector("[data-masthead]");
    if (!mount) return;
    var page = mount.getAttribute("data-page") || "";

    mount.appendChild(el("h1", { class: "wordmark" }, [
      el("a", { href: "index.html" }, [(site && site.name) || ""]),
    ]));

    var nav = el("nav", { class: "site-nav" });
    NAV.forEach(function (item) {
      var a = el("a", { href: item.href }, [item.label]);
      if (item.href === page) a.className = "active";
      nav.appendChild(a);
    });
    mount.appendChild(nav);
  }

  /* ---- Home photo (single) -------------------------------------------- */
  function renderHome(site) {
    var mount = document.querySelector("[data-home]");
    if (!mount) return;
    // Prefer the single `homePhoto`; fall back to a legacy homePhotos[0].
    var src = (site && site.homePhoto) ||
      (site && site.homePhotos && site.homePhotos[0] && site.homePhotos[0].src) || "";

    var frame = el("div", { class: "home-photo-frame" });
    function placeholder() {
      frame.innerHTML = "";
      frame.appendChild(el("div", { class: "placeholder" }, ["add a photo in the admin"]));
    }
    if (!src) {
      placeholder();
    } else {
      var img = el("img", { src: window.assetUrl(src), alt: (site && site.name) || "" });
      img.onerror = placeholder;
      frame.appendChild(img);
      // Caption allows light inline formatting (e.g. <i> for a title).
      var caption = site && site.homeCaption;
      if (caption) frame.appendChild(el("div", { class: "home-caption", html: caption }));
    }
    mount.appendChild(el("div", { class: "home-stage" }, [frame]));
  }

  /* ---- Publications ---------------------------------------------------- */
  function renderPubItem(mount, p) {
    if (!p || !p.title) return;
    var titleEl = p.url
      ? el("span", { class: "pub-title" }, [el("a", { href: p.url, target: "_blank", rel: "noopener" }, [p.title])])
      : el("span", { class: "pub-title" }, [p.title]);

    var pub = el("div", { class: "pub" }, [titleEl]);

    var tail = [];
    if (p.venue) tail.push(p.venue);
    if (p.year) tail.push(String(p.year));
    if (tail.length) {
      pub.appendChild(el("div", { class: "pub-meta" }, [tail.join(", ") + "."]));
    }
    if (p.note) pub.appendChild(el("div", { class: "pub-note" }, [p.note]));
    mount.appendChild(pub);
  }

  // Convert legacy flat `items` (each with a `type`) into grouped form.
  function groupsFromFlat(items) {
    var byType = {}, order = PUB_ORDER.slice();
    items.forEach(function (p) {
      var t = p.type || "Other";
      if (order.indexOf(t) === -1) order.push(t);
      (byType[t] = byType[t] || []).push(p);
    });
    return order.filter(function (t) { return byType[t]; }).map(function (t) {
      return { heading: PUB_HEADING[t] || t, items: byType[t] };
    });
  }

  function renderPublications(data) {
    var mount = document.querySelector("[data-publications]");
    if (!mount) return;

    var groups = (data && data.groups) ||
      (data && data.items ? groupsFromFlat(data.items) : []);

    var hasAny = groups.some(function (g) { return g.items && g.items.length; });
    if (!hasAny) {
      mount.appendChild(el("p", { class: "pub-note" }, ["No publications listed yet."]));
      return;
    }

    groups.forEach(function (g) {
      if (!g || !g.items || !g.items.length) return;
      if (g.heading) mount.appendChild(el("h2", { class: "section" }, [g.heading]));
      g.items.forEach(function (p) { renderPubItem(mount, p); });
    });
  }

  /* ---- About + contact ------------------------------------------------ */
  function renderAbout(site) {
    var mount = document.querySelector("[data-about]");
    if (!mount) return;
    var a = (site && site.about) || {};

    // Bio: split plain text into paragraphs on blank lines.
    String(a.bio || "").split(/\n\s*\n/).forEach(function (para) {
      var t = para.trim();
      if (t) mount.appendChild(el("p", {}, [t]));
    });

    if (a.email) {
      var line = el("div", { class: "contact-line" });
      line.appendChild(el("span", { class: "label" }, ["Email: "]));
      var parts = String(a.email).split("@");
      // Assemble at runtime so the address isn't a plain string in the HTML.
      var link = el("a", { href: "mailto:" + parts[0] + "@" + (parts[1] || "") }, [a.email]);
      line.appendChild(link);
      mount.appendChild(line);
    }

    var links = (a.links || []).filter(function (l) { return l && l.label && l.href && l.href !== "#"; });
    if (links.length) {
      var linksLine = el("div", { class: "contact-line" });
      links.forEach(function (l, idx) {
        if (idx) linksLine.appendChild(document.createTextNode("  ·  "));
        linksLine.appendChild(el("a", { href: l.href, target: "_blank", rel: "noopener" }, [l.label]));
      });
      mount.appendChild(linksLine);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.DATA.loadSite().then(function (site) {
      renderMasthead(site);
      renderHome(site);
      renderAbout(site);
    }).catch(function (e) {
      // Still render the masthead shell so nav works even if data fails.
      renderMasthead({ name: "Robert Baskin" });
      console.warn("Could not load site.json:", e);
    });

    if (document.querySelector("[data-publications]")) {
      window.DATA.loadPublications()
        .then(renderPublications)
        .catch(function (e) { console.warn("Could not load publications.json:", e); });
    }
  });
})();
