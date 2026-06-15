(function () {
  "use strict";

  var config = window.BoraMigaConfig || { links: {} };
  var data = window.BoraMigaData || { experiences: [], safety: [], faq: [] };

  var navSectionIds = ["home", "por-que", "como-funciona", "clube", "seguranca", "faq"];
  var headerOffset = 88;
  var scrollTicking = false;

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

    var noteHtml = data.experiencesNote
      ? '<p class="exp-note">' + escapeHtml(data.experiencesNote) + "</p>"
      : "";

    var html = data.experiences
      .map(function (cat) {
        var body = cat.description
          ? '<p class="exp-category__text">' + escapeHtml(cat.description) + "</p>"
          : '<ul class="exp-chips" role="list">' +
            cat.items
              .map(function (item) {
                return '<li class="exp-chip">' + escapeHtml(item) + "</li>";
              })
              .join("") +
            "</ul>";

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
          body +
          "</article>"
        );
      })
      .join("");

    root.innerHTML = noteHtml + html;
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
        var qId = "faq-question-" + i;
        return (
          '<div class="faq-item" role="group">' +
          '<button type="button" class="faq-item__btn" id="' +
          qId +
          '" aria-expanded="false" aria-controls="' +
          id +
          '">' +
          "<span>" +
          escapeHtml(item.q) +
          "</span>" +
          '<span class="faq-item__icon" aria-hidden="true">+</span>' +
          "</button>" +
          '<div class="faq-item__panel" id="' +
          id +
          '" role="region" aria-labelledby="' +
          qId +
          '" hidden>' +
          "<p>" +
          escapeHtml(item.a) +
          "</p>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function toggleFAQ(btn) {
    var root = document.getElementById("faq-root");
    if (!root || !btn) return;

    var item = btn.closest(".faq-item");
    var panel = item && item.querySelector(".faq-item__panel");
    if (!item || !panel) return;

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
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function closeMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu de navegação");
    document.body.classList.remove("nav-open");
  }

  function handleAnchorClick(anchor, e) {
    var targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;
    var target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    if (targetId === "#home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    history.pushState(null, "", targetId);

    var focusTarget = target.querySelector("h1, h2, .section__title, .mission__title") || target;
    if (!focusTarget.hasAttribute("tabindex")) {
      focusTarget.setAttribute("tabindex", "-1");
    }
    focusTarget.focus({ preventScroll: true });
  }

  function updateOnScroll() {
    var header = document.querySelector(".site-header");
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    var navLinks = document.querySelectorAll(".nav-link");
    if (navLinks.length) {
      var sections = navSectionIds
        .map(function (id) {
          return document.getElementById(id);
        })
        .filter(Boolean);

      if (sections.length) {
        var scrollPos = window.scrollY + headerOffset;
        var currentId = sections[0].getAttribute("id");

        for (var i = sections.length - 1; i >= 0; i--) {
          if (sections[i].offsetTop <= scrollPos) {
            currentId = sections[i].getAttribute("id");
            break;
          }
        }

        navLinks.forEach(function (link) {
          var isActive = link.getAttribute("href") === "#" + currentId;
          link.classList.toggle("is-active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      }
    }

    scrollTicking = false;
  }

  function onScroll() {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateOnScroll);
    }
  }

  function initDelegatedEvents() {
    var faqRoot = document.getElementById("faq-root");
    var nav = document.getElementById("menu-principal");
    var toggle = document.querySelector(".nav-toggle");

    document.addEventListener(
      "click",
      function (e) {
        var faqBtn = faqRoot && e.target.closest(".faq-item__btn");
        if (faqBtn && faqRoot.contains(faqBtn)) {
          toggleFAQ(faqBtn);
          return;
        }

        var anchor = e.target.closest('a[href^="#"]');
        if (anchor) {
          handleAnchorClick(anchor, e);
        }

        if (
          nav &&
          e.target.closest(".site-header__nav .nav-link, .site-header__nav .site-header__cta") &&
          window.innerWidth < 768 &&
          document.body.classList.contains("nav-open")
        ) {
          closeMobileNav();
        }
      },
      false
    );

    document.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Escape") {
          closeMobileNav();
          return;
        }

        if (e.key !== "Enter" && e.key !== " ") return;

        var faqBtn = faqRoot && e.target.closest(".faq-item__btn");
        if (faqBtn && faqRoot.contains(faqBtn)) {
          e.preventDefault();
          toggleFAQ(faqBtn);
        }
      },
      false
    );

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var isOpen = toggle.getAttribute("aria-expanded") === "true";
        var nextOpen = !isOpen;
        toggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
        toggle.setAttribute(
          "aria-label",
          nextOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"
        );
        document.body.classList.toggle("nav-open", nextOpen);
      });
    }

    window.addEventListener(
      "resize",
      function () {
        if (window.innerWidth >= 768) closeMobileNav();
        updateOnScroll();
      },
      { passive: true }
    );
  }

  function initScrollHandlers() {
    updateOnScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initAOS() {
    if (typeof AOS === "undefined") return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    var startAOS = function () {
      AOS.init({
        duration: 550,
        easing: "ease-out-cubic",
        once: true,
        offset: 80,
        delay: 0,
        mirror: false,
        anchorPlacement: "top-bottom",
        disableMutationObserver: true,
        throttleDelay: 99,
        debounceDelay: 50
      });
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(startAOS, { timeout: 1200 });
    } else {
      window.setTimeout(startAOS, 200);
    }
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
    initDelegatedEvents();
    initScrollHandlers();
    initAOS();
    initFooterYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
