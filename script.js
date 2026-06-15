(function () {
  "use strict";

  var config = window.BoraMigaConfig || { links: {} };
  var data = window.BoraMigaData || { experiences: [], safety: [], faq: [] };

  function initLinks() {
    var links = config.links;
    if (!links) return;

    document.querySelectorAll("[data-link]").forEach(function (el) {
      var key = el.getAttribute("data-link");
      var url = links[key];
      if (!url) return;

      if (key === "email") {
        el.setAttribute("href", "mailto:" + url);
      } else {
        el.setAttribute("href", url);
      }
    });

    var emailText = document.querySelector("[data-email-text]");
    if (emailText && links.email) {
      emailText.textContent = links.email;
    }
  }

  function renderExperiences() {
    var root = document.getElementById("experiences-root");
    if (!root || !data.experiences.length) return;

    var html = data.experiences
      .map(function (cat) {
        var chips = cat.items
          .map(function (item) {
            return '<li class="exp-chip">' + escapeHtml(item) + "</li>";
          })
          .join("");

        return (
          '<article class="exp-category" id="exp-' +
          cat.id +
          '">' +
          '<div class="exp-category__head">' +
          '<span class="exp-category__icon" aria-hidden="true">' +
          cat.icon +
          "</span>" +
          "<h3 class=\"exp-category__title\">" +
          escapeHtml(cat.title) +
          "</h3>" +
          "</div>" +
          '<ul class="exp-chips" role="list">' +
          chips +
          "</ul>" +
          "</article>"
        );
      })
      .join("");

    root.innerHTML = html;
  }

  function renderSafety() {
    var root = document.getElementById("safety-root");
    if (!root || !data.safety.length) return;

    root.innerHTML = data.safety
      .map(function (item) {
        return (
          '<article class="safety-card">' +
          '<div class="safety-card__icon" aria-hidden="true">' +
          item.icon +
          "</div>" +
          "<h3 class=\"safety-card__title\">" +
          escapeHtml(item.title) +
          "</h3>" +
          "<p class=\"safety-card__text\">" +
          escapeHtml(item.text) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderFAQ() {
    var root = document.getElementById("faq-root");
    if (!root || !data.faq.length) return;

    root.innerHTML = data.faq
      .map(function (item, i) {
        var id = "faq-panel-" + i;
        return (
          '<div class="faq-item">' +
          '<button type="button" class="faq-item__btn" aria-expanded="false" aria-controls="' +
          id +
          '">' +
          "<span>" +
          escapeHtml(item.q) +
          "</span>" +
          '<span class="faq-item__icon" aria-hidden="true">+</span>' +
          "</button>" +
          '<div class="faq-item__panel" id="' +
          id +
          '" hidden>' +
          "<p>" +
          escapeHtml(item.a) +
          "</p>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    root.querySelectorAll(".faq-item__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var panel = item.querySelector(".faq-item__panel");
        var isOpen = item.classList.contains("is-open");

        root.querySelectorAll(".faq-item").forEach(function (other) {
          other.classList.remove("is-open");
          var otherBtn = other.querySelector(".faq-item__btn");
          var otherPanel = other.querySelector(".faq-item__panel");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          if (otherPanel) otherPanel.hidden = true;
        });

        if (!isOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("menu-principal");
    if (!toggle || !nav) return;

    var links = nav.querySelectorAll(".nav-link, .site-header__cta");

    function closeNav() {
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
      document.body.classList.toggle("nav-open", !isOpen);
    });

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth < 768) closeNav();
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  function initActiveNav() {
    var sections = document.querySelectorAll("section[id]");
    var navLinks = document.querySelectorAll(".nav-link");
    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", targetId);
      });
    });
  }

  function initAOS() {
    if (typeof AOS === "undefined") return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    AOS.init({ duration: 650, easing: "ease-out-cubic", once: true, offset: 48, disable: reduced });
  }

  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function init() {
    initLinks();
    renderExperiences();
    renderSafety();
    renderFAQ();
    initHeader();
    initMobileNav();
    initActiveNav();
    initSmoothAnchors();
    initAOS();
    initFooterYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
