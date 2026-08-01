/* Renders masthead, home, publications, and about from the JSON data files. */
(function () {
  "use strict";

  // Order publication groups render in, and the section heading for each type.
  var PUB_ORDER = ["Journal article", "Conference paper", "Preprint / working paper"];
  var PUB_HEADING = {
    "Journal article": "Journal articles",
    "Conference paper": "Conference papers",
    "Preprint / working paper": "Preprints & working papers",
  };
  // Author-name variants to bold within author lists.
  var AUTHOR_VARIANTS = ["Baskin, R.", "Robby Baskin", "R. Baskin"];

  // Fixed nav (labels + targets). Kept in code since it rarely changes.
  var NAV = [
    { label: "publications", href: "publications.html" },
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

  /* ---- Home rotating photo -------------------------------------------- */
  function renderHome(site) {
    var mount = document.querySelector("[data-home]");
    if (!mount) return;
    var photos = ((site && site.homePhotos) || []).slice();
    var i = 0;

    var frame = el("div", { class: "home-photo-frame" });
    var btn = el("button", { class: "rotate-btn", "aria-label": "Next photo" }, ["→"]);

    function placeholder() {
      frame.innerHTML = "";
      frame.appendChild(el("div", { class: "placeholder" }, ["add a photo in the admin"]));
    }
    function show() {
      var p = photos[i];
      if (!p || !p.src) return placeholder();
      frame.innerHTML = "";
      var img = el("img", { src: window.assetUrl(p.src), alt: p.alt || "" });
      img.onerror = placeholder;
      frame.appendChild(img);
    }

    btn.addEventListener("click", function () {
      if (!photos.length) return;
      i = (i + 1) % photos.length;
      show();
    });

    show();
    var stage = el("div", { class: "home-stage" }, [frame]);
    if (photos.length > 1) stage.appendChild(btn);
    mount.appendChild(stage);
  }

  /* ---- Publications ---------------------------------------------------- */
  function boldAuthors(authors) {
    var span = el("span");
    var html = authors;
    AUTHOR_VARIANTS.forEach(function (n) {
      if (!n) return;
      var esc = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      html = html.replace(new RegExp(esc, "g"), '<span class="me">' + n + "</span>");
    });
    span.innerHTML = html;
    return span;
  }

  function renderPublications(data) {
    var mount = document.querySelector("[data-publications]");
    if (!mount) return;
    var items = (data && data.items) || [];

    // Group by type, preserving input order within each group.
    var byType = {};
    items.forEach(function (p) {
      var t = p.type || "Other";
      (byType[t] = byType[t] || []).push(p);
    });
    var order = PUB_ORDER.slice();
    Object.keys(byType).forEach(function (t) {
      if (order.indexOf(t) === -1) order.push(t);
    });

    if (!items.length) {
      mount.appendChild(el("p", { class: "pub-note" }, ["No publications listed yet."]));
      return;
    }

    order.forEach(function (type) {
      var group = byType[type];
      if (!group || !group.length) return;
      mount.appendChild(el("h2", { class: "section" }, [PUB_HEADING[type] || type]));

      group.forEach(function (p) {
        var titleEl = p.url
          ? el("span", { class: "pub-title" }, [el("a", { href: p.url, target: "_blank", rel: "noopener" }, [p.title])])
          : el("span", { class: "pub-title" }, [p.title]);

        var meta = el("div", { class: "pub-meta" });
        if (p.authors) meta.appendChild(boldAuthors(p.authors));
        var tail = [];
        if (p.venue) tail.push(p.venue);
        if (p.year) tail.push(String(p.year));
        if (tail.length) {
          var sep = p.authors ? (/[.!?]\s*$/.test(p.authors) ? " " : ". ") : "";
          meta.appendChild(document.createTextNode(sep + tail.join(", ") + "."));
        }

        var pub = el("div", { class: "pub" }, [titleEl, meta]);
        if (p.note) pub.appendChild(el("div", { class: "pub-note" }, [p.note]));
        mount.appendChild(pub);
      });
    });
  }

  /* ---- About + contact ------------------------------------------------ */
  function renderAbout(site) {
    var mount = document.querySelector("[data-about]");
    if (!mount) return;
    var a = (site && site.about) || {};

    var photo = el("div", { class: "about-photo" });
    if (a.photo) {
      var img = el("img", { src: window.assetUrl(a.photo), alt: (site && site.name) || "" });
      img.onerror = function () {
        photo.innerHTML = "";
        photo.appendChild(el("div", { class: "placeholder" }, ["add a photo in the admin"]));
      };
      photo.appendChild(img);
    } else {
      photo.appendChild(el("div", { class: "placeholder" }, ["photo"]));
    }
    mount.appendChild(photo);

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
      renderMasthead({ name: "Robby Baskin" });
      console.warn("Could not load site.json:", e);
    });

    if (document.querySelector("[data-publications]")) {
      window.DATA.loadPublications()
        .then(renderPublications)
        .catch(function (e) { console.warn("Could not load publications.json:", e); });
    }
  });
})();
